import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface ParkingSlot {
    id: number;
    name: string;
    availability: {
        today: AvailabilitySlot[];
        tomorrow: AvailabilitySlot[];
    };
}

export interface AvailabilitySlot {
    start: string;
    end: string;
    bikes_available?: number;
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

const adminAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

adminAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;  // Add 'Bearer ' prefix
    }
    return config;
});

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

    getBookings: (userId: number) =>
        axios.get<Booking[]>(`${API_URL}/bookings`, { params: { user_id: userId } }),

    bookSlot: (bookingData: { slot_id: number; vehicle_type: 'car' | 'bike'; start_time: string; end_time: string; user_id: number }) =>
        axios.post<Booking>(`${API_URL}/book`, bookingData),

    cancelBooking: (bookingId: number) =>
        axios.post(`${API_URL}/cancel-booking`, { booking_id: bookingId }),

    raiseComplaint: (complaintData: { user_id: number, slot_name: string, description: string }) =>
        axios.post(`${API_URL}/complaint`, complaintData),

    // Add a new function to get all complaints (for future admin panel use)
    getComplaints: () =>
        axios.get(`${API_URL}/complaints`),

    // Add these new functions
    adminLogin: (credentials: { username: string; password: string }) =>
        axios.post(`${API_URL}/admin/login`, credentials),

    getAllBookings: () =>
        adminAxios.get<AdminBooking[]>(`/admin/bookings`),

    getAllComplaints: () =>
        adminAxios.get<Complaint[]>(`/admin/complaints`),
};

interface AdminBooking extends Booking {
    user_id: number;
}

interface Complaint {
    id: number;
    user_id: number;
    slot_name: string;
    description: string;
    status: string;
    created_at: string;
}
