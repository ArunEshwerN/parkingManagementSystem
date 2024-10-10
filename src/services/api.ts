import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
    signup: (userData: any) => axios.post(`${API_URL}/signup`, userData),
    login: (credentials: any) => {
        console.log('Login request data:', credentials);
        return axios.post(`${API_URL}/login`, credentials);
    },
    forgotPassword: (email: string) => axios.post(`${API_URL}/forgot-password`, { email }),
    resetPassword: (token: string, newPassword: string) => axios.post(`${API_URL}/reset-password`, { token, new_password: newPassword }),
    getParkingSlots: () => axios.get(`${API_URL}/parking-slots`),
    bookSlot: (bookingData: any) => axios.post(`${API_URL}/book`, bookingData),
    cancelBooking: (bookingId: number) => axios.post(`${API_URL}/cancel-booking`, { booking_id: bookingId }),
    getBookings: (userId: number) => axios.get(`${API_URL}/bookings`, { params: { user_id: userId } }),
    raiseComplaint: (complaintData: any) => axios.post(`${API_URL}/complaint`, complaintData),
};
