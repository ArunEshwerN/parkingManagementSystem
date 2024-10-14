
# Parking Management System

A modern, user-friendly parking management system built with React and Flask.

## Features

- User authentication (signup, login, forgot password)
- Admin dashboard for managing bookings and complaints
- Real-time parking slot availability
- Booking system for parking slots
- Complaint management system
- Responsive design for desktop and mobile devices

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Axios for API calls

### Backend
- Flask
- SQLAlchemy
- Flask-CORS
- Flask-Mail for email functionality

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- MySQL

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/parking-management-system.git
   cd parking-management-system
   ```

2. Set up the frontend
   ```
   cd frontend
   npm install
   ```

3. Set up the backend
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

4. Set up the database
   - Create a MySQL database named `parking_management`
   - Update the database connection string in `backend/app.py`

5. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add necessary environment variables (e.g., `SECRET_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`)

### Running the Application

1. Start the backend server
   ```
   cd backend
   flask run
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`
=======


