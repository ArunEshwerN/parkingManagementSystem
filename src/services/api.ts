import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface ParkingSlot {
    id: number;
    name: string;
    is_available: boolean;
    booked_until?: string;
    vehicle_type?: 'car' | 'bike';
}

export interface Booking {
    id: number;
    slot_id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
    vehicle_type: 'car' | 'bike';
}

export interface LoginResponse {
    message: string;
    user_id: number;
}

export const api = {
    signup: (userData: { name: string; username: string; email: string; password: string }) =>
        axios.post(`${API_URL}/signup`, userData),

    login: (credentials: { identifier: string; password: string }) =>
        axios.post<LoginResponse>(`${API_URL}/login`, credentials),

    forgotPassword: (email: string) =>
        axios.post(`${API_URL}/forgot-password`, { email }),

    resetPassword: (token: string, newPassword: string) =>
        axios.post(`${API_URL}/reset-password`, { token, new_password: newPassword }),

    getParkingSlots: () =>
        axios.get<ParkingSlot[]>(`${API_URL}/parking-slots`),

    getBookings: () =>
        axios.get<Booking[]>(`${API_URL}/bookings`),

    bookSlot: (bookingData: { slot_id: number; vehicle_type: 'car' | 'bike'; start_time: string; end_time: string; user_id: number }) =>
        axios.post<Booking>(`${API_URL}/book`, bookingData),

    cancelBooking: (bookingId: number) =>
        axios.post(`${API_URL}/cancel-booking`, { booking_id: bookingId }),

    raiseComplaint: (complaintData: { description: string }) =>
        axios.post(`${API_URL}/complaint`, complaintData),
};