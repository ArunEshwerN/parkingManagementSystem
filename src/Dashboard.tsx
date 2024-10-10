import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

interface ParkingSlot {
    id: number;
    name: string;
    is_available: boolean;
    booked_until?: string;
}

interface Booking {
    id: number;
    slot_id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
    vehicle_type: string;
}

interface BookingData {
    slot_id: number;
    vehicle_type: string;
    start_time: string;
    end_time: string;
    user_id: number;
}

export default function Dashboard() {
    const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
    const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [complaint, setComplaint] = useState('');
    const navigate = useNavigate();

    // Assume we have a way to get the current user's ID
    const userId = 1; // This should be replaced with the actual user ID from your authentication system

    useEffect(() => {
        fetchParkingSlots();
        fetchBookings();
    }, []);

    const fetchParkingSlots = async () => {
        try {
            const response = await api.getParkingSlots();
            setParkingSlots(response.data);
        } catch (error) {
            console.error('Failed to fetch parking slots', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.getBookings(userId);
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;

        const bookingData: BookingData = {
            slot_id: selectedSlot.id,
            vehicle_type: vehicleType,
            start_time: startTime,
            end_time: endTime,
            user_id: userId,
        };

        try {
            await api.bookSlot(bookingData);
            alert('Booking successful!');
            fetchParkingSlots();
            fetchBookings();
            setSelectedSlot(null);
        } catch (error) {
            console.error('Booking failed', error);
            alert('Booking failed. Please try again.');
        }
    };

    const handleCancel = async (bookingId: number) => {
        try {
            await api.cancelBooking(bookingId);
            alert('Booking cancelled successfully!');
            fetchBookings();
            fetchParkingSlots();
        } catch (error) {
            console.error('Cancellation failed', error);
            alert('Cancellation failed. Please try again.');
        }
    };

    const handleComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.raiseComplaint({ description: complaint, user_id: userId });
            alert('Complaint submitted successfully!');
            setComplaint('');
        } catch (error) {
            console.error('Failed to submit complaint', error);
            alert('Failed to submit complaint. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">Parking Dashboard</h1>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>

            <Tabs defaultValue="book" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="book">Book</TabsTrigger>
                    <TabsTrigger value="view">View Bookings</TabsTrigger>
                    <TabsTrigger value="complaint">Raise Complaint</TabsTrigger>
                </TabsList>

                <TabsContent value="book">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parkingSlots.map((slot) => (
                            <Card key={slot.id} className={`${slot.is_available ? 'bg-green-100' : 'bg-red-100'}`}>
                                <CardHeader>
                                    <CardTitle>{slot.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{slot.is_available ? 'Available' : 'Not Available'}</p>
                                    {slot.booked_until && <p>Booked until: {slot.booked_until}</p>}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button className="mt-2" disabled={!slot.is_available}>Book Now</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Book Parking Slot</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Please enter the details to book this parking slot.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="vehicle-type" className="text-right">
                                                        Vehicle Type
                                                    </Label>
                                                    <select
                                                        id="vehicle-type"
                                                        className="col-span-3"
                                                        value={vehicleType}
                                                        onChange={(e) => setVehicleType(e.target.value as 'car' | 'bike')}
                                                    >
                                                        <option value="car">Car</option>
                                                        <option value="bike">Bike</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="start-time" className="text-right">
                                                        Start Time
                                                    </Label>
                                                    <Input
                                                        id="start-time"
                                                        type="datetime-local"
                                                        className="col-span-3"
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="end-time" className="text-right">
                                                        End Time
                                                    </Label>
                                                    <Input
                                                        id="end-time"
                                                        type="datetime-local"
                                                        className="col-span-3"
                                                        value={endTime}
                                                        onChange={(e) => setEndTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleBook}>Book</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="view">
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardHeader>
                                    <CardTitle>Booking for Slot {booking.slot_name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Vehicle Type: {booking.vehicle_type}</p>
                                    <p>Start Time: {new Date(booking.start_time).toLocaleString()}</p>
                                    <p>End Time: {new Date(booking.end_time).toLocaleString()}</p>
                                    <Button onClick={() => handleCancel(booking.id)} className="mt-2" variant="destructive">
                                        Cancel Booking
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="complaint">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raise a Complaint</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleComplaint} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="complaint">Complaint Description</Label>
                                    <textarea
                                        id="complaint"
                                        className="w-full p-2 border rounded"
                                        value={complaint}
                                        onChange={(e) => setComplaint(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit">Submit Complaint</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}