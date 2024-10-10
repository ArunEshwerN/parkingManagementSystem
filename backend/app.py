from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Clash12345@localhost/parking_management'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'gclasher58@gmail.com'  # Replace with your actual Gmail address
app.config['MAIL_PASSWORD'] = 'sala jzvh crdm tbeq'  # Replace with your actual app password
app.config['MAIL_DEFAULT_SENDER'] = 'gclasher58@gmail.com'  # Replace with your actual Gmail address

db = SQLAlchemy(app)
mail = Mail(app)

# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

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
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Open')

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
    slots = ParkingSlot.query.all()
    return jsonify([{'id': slot.id, 'name': slot.name, 'is_available': slot.is_available} for slot in slots])

@app.route('/api/book', methods=['POST'])
def book_slot():
    data = request.json
    # Implement booking logic
    return jsonify({'message': 'Booking successful'}), 201

@app.route('/api/cancel-booking', methods=['POST'])
def cancel_booking():
    data = request.json
    # Implement cancellation logic
    return jsonify({'message': 'Booking cancelled successfully'}), 200

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    user_id = request.args.get('user_id')
    bookings = Booking.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': booking.id,
        'slot_id': booking.slot_id,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'vehicle_type': booking.vehicle_type
    } for booking in bookings])

@app.route('/api/complaint', methods=['POST'])
def raise_complaint():
    data = request.json
    new_complaint = Complaint(user_id=data['user_id'], description=data['description'])
    db.session.add(new_complaint)
    db.session.commit()
    return jsonify({'message': 'Complaint raised successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)