import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Button } from "./components/ui";

interface Booking {
    id: number;
    user_id: number;
    slot_id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
    vehicle_type: string;
}

interface Complaint {
    id: number;
    user_id: number;
    slot_name: string;
    description: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
        fetchComplaints();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.getAllBookings();
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await api.getAllComplaints();
            setComplaints(response.data);
        } catch (error) {
            console.error('Failed to fetch complaints', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.adminLogout();
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
            alert('Logout failed. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
            <Tabs defaultValue="bookings">
                <TabsList>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="complaints">Complaints</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings.map((booking) => (
                                <div key={booking.id} className="mb-4 p-4 border rounded">
                                    <p>Booking ID: {booking.id}</p>
                                    <p>User ID: {booking.user_id}</p>
                                    <p>Slot: {booking.slot_name}</p>
                                    <p>Start Time: {new Date(booking.start_time).toLocaleString()}</p>
                                    <p>End Time: {new Date(booking.end_time).toLocaleString()}</p>
                                    <p>Vehicle Type: {booking.vehicle_type}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="complaints">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Complaints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="mb-4 p-4 border rounded">
                                    <p>Complaint ID: {complaint.id}</p>
                                    <p>User ID: {complaint.user_id}</p>
                                    <p>Slot: {complaint.slot_name}</p>
                                    <p>Description: {complaint.description}</p>
                                    <p>Status: {complaint.status}</p>
                                    <p>Created At: {new Date(complaint.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
