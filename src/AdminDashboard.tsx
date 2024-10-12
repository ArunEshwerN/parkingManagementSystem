import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Clock, User, MapPin } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-100">
            <header className="bg-primary text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <Button onClick={handleLogout} variant="outline" className="bg-white text-primary hover:bg-gray-100 border-white transition-colors duration-300">
                        Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-4 mt-8">
                <Tabs defaultValue="bookings" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 gap-4">
                        <TabsTrigger value="bookings" className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300">Bookings</TabsTrigger>
                        <TabsTrigger value="complaints" className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300">Complaints</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bookings">
                        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-2xl font-bold text-primary">All Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <Card key={booking.id} className="bg-white shadow rounded-lg overflow-hidden">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                                    <User className="w-4 h-4 mr-2" />
                                                    User ID: {booking.user_id}
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    Slot: {booking.slot_name}
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="complaints">
                        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-2xl font-bold text-primary">All Complaints</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {complaints.map((complaint) => (
                                        <Card key={complaint.id} className="bg-white shadow rounded-lg overflow-hidden">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                                    <User className="w-4 h-4 mr-2" />
                                                    User ID: {complaint.user_id}
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    Slot: {complaint.slot_name}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Description: {complaint.description}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Status: {complaint.status}
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Created At: {new Date(complaint.created_at).toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
