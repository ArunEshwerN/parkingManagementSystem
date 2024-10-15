from flask import Flask, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import os
from flask_migrate import Migrate
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Clash12345@localhost/parking_management'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = ''  # Replace with your actual Gmail address
app.config['MAIL_PASSWORD'] = ''  # Replace with your actual app password
app.config['MAIL_DEFAULT_SENDER'] = ''  # Replace with your actual Gmail address

db = SQLAlchemy(app)
mail = Mail(app)
migrate = Migrate(app, db)

# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class ParkingSlot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    is_available = db.Column(db.Boolean, default=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('parking_slot.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    slot_name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PasswordReset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

# API routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    hashed_password = generate_password_hash(data['password'])
    new_user = User(name=data['name'], username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    print('Login attempt with data:', data)  # Log the incoming data
    user = User.query.filter((User.username == data['identifier']) | (User.email == data['identifier'])).first()
    if user:
        print('User found:', user.username)  # Log if user is found
        if check_password_hash(user.password, data['password']):
            print('Password correct')  # Log if password is correct
            return jsonify({'message': 'Login successful', 'user_id': user.id}), 200
        else:
            print('Password incorrect')  # Log if password is incorrect
    else:
        print('User not found')  # Log if user is not found
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user:
        try:
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(hours=1)
            reset_request = PasswordReset(user_id=user.id, token=token, expires_at=expires_at)
            db.session.add(reset_request)
            db.session.commit()
    
            reset_link = f"http://localhost:3000/reset-password/{token}"
            
            msg = Message("Password Reset Request",
                          recipients=[user.email],
                          sender=app.config['MAIL_DEFAULT_SENDER'])
            msg.body = f"Click the following link to reset your password: {reset_link}"
            mail.send(msg)

            return jsonify({'message': 'Password reset instructions sent to your email'}), 200
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            db.session.rollback()
            return jsonify({'message': 'An error occurred while processing your request'}), 500
    return jsonify({'message': 'Email not found'}), 404

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    reset_request = PasswordReset.query.filter_by(token=data['token']).first()
    if reset_request and reset_request.expires_at > datetime.utcnow():
        user = User.query.get(reset_request.user_id)
        user.password = generate_password_hash(data['new_password'])
        db.session.delete(reset_request)
        db.session.commit()
        return jsonify({'message': 'Password reset successful'}), 200
    return jsonify({'message': 'Invalid or expired token'}), 400

@app.route('/api/parking-slots', methods=['GET'])
def get_parking_slots():
    try:
        slots = ParkingSlot.query.all()
        print(f"Found {len(slots)} parking slots")  # Debug print

        current_time = datetime.utcnow()
        tomorrow = current_time + timedelta(days=1)
        start_of_today = current_time.replace(hour=8, minute=0, second=0, microsecond=0)
        end_of_today = current_time.replace(hour=22, minute=0, second=0, microsecond=0)
        start_of_tomorrow = tomorrow.replace(hour=8, minute=0, second=0, microsecond=0)
        end_of_tomorrow = tomorrow.replace(hour=22, minute=0, second=0, microsecond=0)

        slot_info = []
        for slot in slots:
            bookings = Booking.query.filter(
                Booking.slot_id == slot.id,
                Booking.end_time > start_of_today,
                Booking.start_time < end_of_tomorrow
            ).order_by(Booking.start_time).all()

            print(f"Slot {slot.name} has {len(bookings)} bookings")  # Debug print

            availability = {
                'today': [],
                'tomorrow': []
            }

            # Initialize with full availability starting from 8:00 AM for both today and tomorrow
            availability['today'].append({
                'start': start_of_today.isoformat(),
                'end': end_of_today.isoformat()
            })
            availability['tomorrow'].append({
                'start': start_of_tomorrow.isoformat(),
                'end': end_of_tomorrow.isoformat()
            })

            for booking in bookings:
                day = 'today' if booking.start_time.date() == current_time.date() else 'tomorrow'
                day_availability = availability[day]

                new_day_availability = []
                for avail_slot in day_availability:
                    avail_start = datetime.fromisoformat(avail_slot['start'])
                    avail_end = datetime.fromisoformat(avail_slot['end'])

                    if booking.start_time >= avail_end or booking.end_time <= avail_start:
                        new_day_availability.append(avail_slot)
                    else:
                        if avail_start < booking.start_time:
                            new_day_availability.append({
                                'start': avail_start.isoformat(),
                                'end': booking.start_time.isoformat()
                            })
                        if booking.end_time < avail_end:
                            new_day_availability.append({
                                'start': booking.end_time.isoformat(),
                                'end': avail_end.isoformat()
                            })

                availability[day] = new_day_availability

            slot_info.append({
                'id': slot.id,
                'name': slot.name,
                'availability': availability
            })

        print(f"Returning {len(slot_info)} slot info objects")  # Debug print
        return jsonify(slot_info)
    except Exception as e:
        print(f"Error in get_parking_slots: {str(e)}")  # Debug print
        return jsonify({'message': 'An error occurred while fetching parking slots'}), 500

@app.route('/api/book', methods=['POST'])
def book_slot():
    try:
        data = request.json
        user_id = data.get('user_id')
        slot_id = data.get('slot_id')
        start_time = datetime.fromisoformat(data.get('start_time'))
        end_time = datetime.fromisoformat(data.get('end_time'))
        vehicle_type = data.get('vehicle_type')

        print(f"Booking request received: {data}")  # Debug print

        # Check if the booking date is valid (today or tomorrow)
        now = datetime.now()
        max_booking_date = now.date() + timedelta(days=1)
        if start_time.date() > max_booking_date:
            return jsonify({'message': 'Bookings are only allowed for today or tomorrow'}), 400

        # Check if the booking time is within operating hours (8:00 AM to 10:00 PM)
        if start_time.time() < datetime.strptime("08:00", "%H:%M").time() or end_time.time() > datetime.strptime("22:00", "%H:%M").time():
            return jsonify({'message': 'Bookings are only allowed between 8:00 AM and 10:00 PM'}), 400

        # Check if the slot is available
        slot = ParkingSlot.query.get(slot_id)
        if not slot:
            return jsonify({'message': 'Slot not found'}), 404

        # Check for overlapping bookings
        overlapping_bookings = Booking.query.filter(
            Booking.slot_id == slot_id,
            Booking.start_time < end_time,
            Booking.end_time > start_time
        ).all()

        if overlapping_bookings:
            return jsonify({'message': 'Slot is already booked for the selected time period'}), 400

        # Create new booking
        new_booking = Booking(
            user_id=user_id,
            slot_id=slot_id,
            start_time=start_time,
            end_time=end_time,
            vehicle_type=vehicle_type
        )

        db.session.add(new_booking)
        db.session.commit()

        print(f"Booking created: {new_booking}")  # Debug print

        return jsonify({'message': 'Booking successful', 'booking_id': new_booking.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in book_slot: {str(e)}")  # Debug print
        return jsonify({'message': 'An error occurred while processing your request'}), 500

@app.route('/api/cancel-booking', methods=['POST'])
def cancel_booking():
    data = request.json
    booking_id = data.get('booking_id')
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    
    db.session.delete(booking)
    db.session.commit()
    
    return jsonify({'message': 'Booking cancelled successfully'}), 200

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    user_id = request.args.get('user_id')
    bookings = Booking.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': booking.id,
        'slot_id': booking.slot_id,
        'slot_name': ParkingSlot.query.get(booking.slot_id).name,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'vehicle_type': booking.vehicle_type
    } for booking in bookings])

@app.route('/api/complaint', methods=['POST'])
def raise_complaint():
    data = request.json
    user_id = data.get('user_id')
    slot_name = data.get('slot_name')
    description = data.get('description')

    if not user_id or not slot_name or not description:
        return jsonify({'message': 'User ID, slot name, and description are required'}), 400

    try:
        new_complaint = Complaint(user_id=user_id, slot_name=slot_name, description=description)
        db.session.add(new_complaint)
        db.session.commit()
        return jsonify({'message': 'Complaint raised successfully', 'complaint_id': new_complaint.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in raise_complaint: {str(e)}")
        return jsonify({'message': 'An error occurred while processing your request'}), 500

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    complaints = Complaint.query.all()
    return jsonify([{
        'id': complaint.id,
        'user_id': complaint.user_id,
        'slot_name': complaint.slot_name,
        'description': complaint.description,
        'status': complaint.status,
        'created_at': complaint.created_at.isoformat()
    } for complaint in complaints])

# Add this function for admin authentication
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(f"Received token: {token}")  # Debug print
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        try:
            # For simplicity, we're just checking if the token exists
            # In a real application, you'd want to verify the token properly
            user = User.query.filter_by(is_admin=True).first()
            if not user:
                raise ValueError('No admin user found')
        except Exception as e:
            print(f"Error in admin_required: {str(e)}")  # Debug print
            return jsonify({'message': 'Invalid token'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Add this route for admin login
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']) and user.is_admin:
        token = secrets.token_urlsafe(32)
        # In a real application, you'd want to store this token securely
        return jsonify({'message': 'Admin login successful', 'token': f'Bearer {token}'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Add this route to get all bookings (for admin)
@app.route('/api/admin/bookings', methods=['GET'])
@admin_required
def get_all_bookings():
    bookings = Booking.query.all()
    return jsonify([{
        'id': booking.id,
        'user_id': booking.user_id,
        'slot_id': booking.slot_id,
        'slot_name': ParkingSlot.query.get(booking.slot_id).name,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'vehicle_type': booking.vehicle_type
    } for booking in bookings])

# Add this route to get all complaints (for admin)
@app.route('/api/admin/complaints', methods=['GET'])
@admin_required
def get_all_complaints():
    complaints = Complaint.query.all()
    return jsonify([{
        'id': complaint.id,
        'user_id': complaint.user_id,
        'slot_name': complaint.slot_name,
        'description': complaint.description,
        'status': complaint.status,
        'created_at': complaint.created_at.isoformat()
    } for complaint in complaints])

# Add this new route for admin logout
@app.route('/api/admin/logout', methods=['POST'])
@admin_required
def admin_logout():
    # In a real-world scenario, you might want to invalidate the token on the server-side
    # For this simple implementation, we'll just return a success message
    return jsonify({'message': 'Admin logged out successfully'}), 200

def create_initial_data():
    with app.app_context():
        if ParkingSlot.query.count() == 0:
            slots = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']
            for slot_name in slots:
                slot = ParkingSlot(name=slot_name)
                db.session.add(slot)
            db.session.commit()
            print("Initial parking slots created")

def create_admin_user():
    with app.app_context():
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            hashed_password = generate_password_hash('admin123')  # Change this to a secure password
            admin = User(name='Admin', username='admin', email='admin@example.com', password=hashed_password, is_admin=True)
            db.session.add(admin)
            db.session.commit()
            print("Admin user created")

# Call this function when your app starts
if __name__ == '__main__':
    create_admin_user()
    app.run(debug=True)

# Add this at the end of your app.py file
if __name__ == '__main__':
    with app.app_context():
        db.drop_all()
        db.create_all()
