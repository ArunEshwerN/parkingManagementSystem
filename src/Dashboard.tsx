import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
import { Clock, Car, Bike } from 'lucide-react';
import axios from 'axios';
import { TimePicker } from './components/TimePicker';

interface ParkingSlot {
    id: number;
    name: string;
    availability: {
        today: AvailabilitySlot[];
        tomorrow: AvailabilitySlot[];
    };
}

interface AvailabilitySlot {
    start: string;
    end: string;
}

interface Booking {
    id: number;
    slot_id: number;
    slot_name: string;
    start_time: string;
    end_time: string;
    vehicle_type: string;
}

export default function Dashboard() {
    const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
    const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
    const [startTime, setStartTime] = useState(new Date().toISOString().split('.')[0]);
    const [endTime, setEndTime] = useState(new Date().toISOString().split('.')[0]);
    const [complaint, setComplaint] = useState('');
    const [complaintSlot, setComplaintSlot] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchParkingSlots();
        fetchBookings();
    }, []);

    const fetchParkingSlots = async () => {
        try {
            const response = await api.getParkingSlots();
            console.log("Received parking slots:", response.data);  // Add this line
            setParkingSlots(response.data);
        } catch (error) {
            console.error('Failed to fetch parking slots', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found');
                return;
            }
            const response = await api.getBookings(parseInt(userId, 10));
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID not found. Please log in again.');
            navigate('/');
            return;
        }

        if (!startTime || !endTime) {
            alert('Please select both start and end times.');
            return;
        }

        try {
            const response = await api.bookSlot({
                slot_id: selectedSlot.id,
                vehicle_type: vehicleType,
                start_time: startTime,
                end_time: endTime,
                user_id: parseInt(userId, 10),
            });
            console.log('Booking response:', response);
            alert('Booking successful!');
            fetchParkingSlots();  // Refresh parking slots
            fetchBookings();      // Refresh bookings
            setSelectedSlot(null);
        } catch (error) {
            console.error('Booking failed', error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Booking failed: ${error.response.data.message}`);
            } else {
                alert('Booking failed: An unexpected error occurred. Please try again.');
            }
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
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('User ID not found. Please log in again.');
            navigate('/');
            return;
        }
        if (!complaintSlot) {
            alert('Please select a slot for your complaint.');
            return;
        }
        try {
            await api.raiseComplaint({
                user_id: parseInt(userId, 10),
                slot_name: complaintSlot,
                description: complaint
            });
            alert('Complaint submitted successfully!');
            setComplaint('');
            setComplaintSlot('');
        } catch (error) {
            console.error('Failed to submit complaint', error);
            alert('Failed to submit complaint. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const renderAvailability = (availability: AvailabilitySlot[], day: string, now: Date) => {
        const filteredAvailability = availability.filter(slot => new Date(slot.end) > now);

        return (
            <div className="mb-2">
                <p className="font-semibold">{day}:</p>
                {filteredAvailability.length > 0 ? (
                    filteredAvailability.map((slot, index) => (
                        <p key={index} className="text-sm">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                        </p>
                    ))
                ) : (
                    <p className="text-sm text-red-500">No availability</p>
                )}
            </div>
        );
    };

    const renderParkingSlotGrid = () => {
        const slots = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
        const now = new Date();

        console.log("Rendering parking slots:", parkingSlots);

        return (
            <div className="grid grid-cols-3 gap-4">
                {slots.map(slotName => {
                    const slot = parkingSlots.find(s => s.name === slotName);

                    return (
                        <Card key={slotName} className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-xl font-bold text-primary">Location {slotName}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {slot ? (
                                    <>
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            Availability:
                                        </p>
                                        {renderAvailability(slot.availability.today, 'Today', now)}
                                        {renderAvailability(slot.availability.tomorrow, 'Tomorrow', now)}
                                        <Button
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                document.getElementById(`booking-dialog-${slot.id}`)?.click();
                                            }}
                                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 mt-4"
                                        >
                                            Book Now
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-600">No data available</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderBookings = () => {
        return (
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <CardHeader className="bg-gray-100 p-4 flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-primary">Booking for Slot {booking.slot_name}</CardTitle>
                            <Button
                                onClick={() => handleCancel(booking.id)}
                                variant="destructive"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600 flex items-center mb-2">
                                {booking.vehicle_type === 'car' ? <Car className="w-4 h-4 mr-2" /> : <Bike className="w-4 h-4 mr-2" />}
                                {booking.vehicle_type.charAt(0).toUpperCase() + booking.vehicle_type.slice(1)}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-primary text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Parking Management Dashboard</h1>
                    <Button onClick={handleLogout} variant="outline" className="bg-white text-primary hover:bg-gray-100 border-white transition-colors duration-300">
                        Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-4 mt-8">
                <Tabs defaultValue="book" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 gap-4">
                        <TabsTrigger value="book" className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300">Book a Slot</TabsTrigger>
                        <TabsTrigger value="view" className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300">View or Cancel Bookings</TabsTrigger>
                        <TabsTrigger value="complaint" className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300">Raise Complaint</TabsTrigger>
                    </TabsList>

                    <TabsContent value="book">
                        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-2xl font-bold text-primary">Available Parking Slots</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {renderParkingSlotGrid()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="view">
                        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-2xl font-bold text-primary">Your Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {renderBookings()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="complaint">
                        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <CardHeader className="bg-gray-200 p-4">
                                <CardTitle className="text-2xl font-bold text-primary">Raise a Complaint</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleComplaint} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="complaintSlot" className="text-lg font-semibold">Select Slot</Label>
                                        <select
                                            id="complaintSlot"
                                            value={complaintSlot}
                                            onChange={(e) => setComplaintSlot(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select a slot</option>
                                            {['A1', 'A2', 'A3', 'B1', 'B2', 'B3'].map((slot) => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="complaint" className="text-lg font-semibold">Complaint Description</Label>
                                        <textarea
                                            id="complaint"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            value={complaint}
                                            onChange={(e) => setComplaint(e.target.value)}
                                            required
                                            rows={4}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">
                                        Submit Complaint
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <AlertDialog>
                <AlertDialogTrigger id={`booking-dialog-${selectedSlot?.id}`} className="hidden" />
                <AlertDialogContent className="bg-white rounded-lg shadow-xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold text-primary mb-2">Book Parking Slot</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            Please enter the details to book this parking slot.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vehicle-type" className="text-right font-semibold">
                                Vehicle Type
                            </Label>
                            <select
                                id="vehicle-type"
                                className="col-span-3 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={vehicleType}
                                onChange={(e) =>
                                    setVehicleType(e.target.value as 'car' | 'bike')
                                }
                            >
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-time" className="text-right font-semibold">
                                Start Time
                            </Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    type="date"
                                    value={startTime.split('T')[0] || ''}
                                    onChange={(e) => {
                                        const date = e.target.value;
                                        const time = startTime.split('T')[1] || '08:00';
                                        setStartTime(`${date}T${time}`);
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                />
                                <TimePicker
                                    value={startTime.split('T')[1]?.slice(0, 5) || '08:00'}
                                    onChange={(time) => {
                                        const date = startTime.split('T')[0] || new Date().toISOString().split('T')[0];
                                        setStartTime(`${date}T${time}`);
                                    }}
                                    min="08:00"
                                    max="22:00"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-time" className="text-right font-semibold">
                                End Time
                            </Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    type="date"
                                    value={endTime.split('T')[0] || ''}
                                    onChange={(e) => {
                                        const date = e.target.value;
                                        const time = endTime.split('T')[1] || '08:00';
                                        setEndTime(`${date}T${time}`);
                                    }}
                                    min={startTime.split('T')[0] || new Date().toISOString().split('T')[0]}
                                    max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                />
                                <TimePicker
                                    value={endTime.split('T')[1]?.slice(0, 5) || '08:00'}
                                    onChange={(time) => {
                                        const date = endTime.split('T')[0] || startTime.split('T')[0] || new Date().toISOString().split('T')[0];
                                        setEndTime(`${date}T${time}`);
                                    }}
                                    min="08:00"
                                    max="22:00"
                                />
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors duration-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBook} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">Book</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}