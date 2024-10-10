import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface BookingData {
    slot_id: number;
    vehicle_type: string;
    start_time: string;
    end_time: string;
    user_id: number; // Add this field
}

export const api = {
    signup: (userData: any) => axios.post(`${API_URL}/signup`, userData),
    login: (credentials: any) => axios.post(`${API_URL}/login`, credentials),
    forgotPassword: (email: string) => axios.post(`${API_URL}/forgot-password`, { email }),
    resetPassword: (token: string, newPassword: string) => axios.post(`${API_URL}/reset-password`, { token, new_password: newPassword }),
    getParkingSlots: () => axios.get(`${API_URL}/parking-slots`),
    getBookings: (userId: number) => axios.get(`${API_URL}/bookings`, { params: { user_id: userId } }),
    bookSlot: (bookingData: BookingData) => axios.post(`${API_URL}/book`, bookingData),
    cancelBooking: (bookingId: number) => axios.post(`${API_URL}/cancel-booking`, { booking_id: bookingId }),
    raiseComplaint: (complaintData: { description: string, user_id: number }) => axios.post(`${API_URL}/complaint`, complaintData),
};