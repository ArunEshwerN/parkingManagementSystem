import { useEffect, useState } from 'react';
import { api } from './services/api';  // Import API service
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./components/ui/card";

// Define the types for the data
interface ParkingSlot {
    id: number;
    name: string;
    is_available: boolean;
}

interface Booking {
    id: number;
    slot_id: number;
    start_time: string;
    end_time: string;
    vehicle_type: string;
}

export default function Dashboard() {
    const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);  // Use ParkingSlot type
    const [bookings, setBookings] = useState<Booking[]>([]);  // Use Booking type
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);  // Selected parking slot
    const [vehicleType, setVehicleType] = useState('');  // Vehicle type
    const [fromTime, setFromTime] = useState('');  // Booking start time
    const [endTime, setEndTime] = useState('');  // Booking end time
    const [complaint, setComplaint] = useState('');  // Complaint description

    // Fetch parking slots and bookings on component load
    useEffect(() => {
        api.getParkingSlots()
            .then(response => {
                console.log('Fetched parking slots:', response.data);  // Log fetched slots
                setParkingSlots(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch parking slots', error);
            });

        const userId = 1;  // Replace with real user ID (can be fetched from login context)
        api.getBookings(userId)
            .then(response => {
                setBookings(response.data);  // Set bookings when fetched
            })
            .catch(error => {
                console.error('Failed to fetch bookings', error);
            });
    }, []);

    // Booking handler
    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const bookingData = {
            slot_id: selectedSlot,
            vehicle_type: vehicleType,
            start_time: fromTime,
            end_time: endTime,
            user_id: 1  // Replace with real user ID from login context
        };

        try {
            const response = await api.bookSlot(bookingData);
            if (response.status === 201) {
                alert('Parking slot booked successfully');
                // Fetch updated bookings
                const userId = 1;  // Replace with real user ID
                api.getBookings(userId).then(response => setBookings(response.data));
            }
        } catch (error) {
            console.error('Booking failed', error);
        }
    };

    // Complaint handler
    const handleComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const complaintData = {
            user_id: 1,  // Replace with real user ID
            description: complaint,
        };

        try {
            const response = await api.raiseComplaint(complaintData);
            if (response.status === 201) {
                alert('Complaint raised successfully');
            }
        } catch (error) {
            console.error('Failed to raise complaint', error);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <h1 className="text-4xl mb-8 text-center">Parking Management Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Available Parking Slots */}
                <Card className="card">
                    <CardHeader className="bg-primary-dark">
                        <CardTitle className="text-2xl">Available Parking Slots</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-primary-light">
                        <ul className="space-y-2">
                            {parkingSlots.map(slot => (
                                <li key={slot.id} className="flex justify-between items-center">
                                    <span>{slot.name}</span>
                                    <span className={`px-2 py-1 rounded ${slot.is_available ? 'bg-secondary text-primary' : 'bg-accent-dark text-foreground'}`}>
                                        {slot.is_available ? 'Available' : 'Booked'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Book Parking Slot Form */}
                <Card className="card">
                    <CardHeader className="bg-primary-dark">
                        <CardTitle className="text-2xl">Book a Parking Slot</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-primary-light">
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="slot">Select Parking Slot</Label>
                                <select id="slot" className="w-full" value={selectedSlot ?? ''} onChange={e => setSelectedSlot(parseInt(e.target.value))} required>
                                    <option value="" disabled>Select a Slot</option>
                                    {parkingSlots.filter(slot => slot.is_available).map(slot => (
                                        <option key={slot.id} value={slot.id}>{slot.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleType">Vehicle Type</Label>
                                <select id="vehicleType" className="w-full" value={vehicleType} onChange={e => setVehicleType(e.target.value)} required>
                                    <option value="" disabled>Select Vehicle Type</option>
                                    <option value="car">Car</option>
                                    <option value="bike">Bike</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fromTime">From Time</Label>
                                <Input id="fromTime" type="datetime-local" value={fromTime} onChange={e => setFromTime(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input id="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                            </div>

                            <Button type="submit" className="btn-primary w-full">Book Slot</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* User's Bookings */}
                <Card className="card">
                    <CardHeader className="bg-primary-dark">
                        <CardTitle className="text-2xl">Your Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-primary-light">
                        <ul className="space-y-2">
                            {bookings.map(booking => (
                                <li key={booking.id} className="bg-primary p-3 rounded">
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Slot {booking.slot_id}</span>
                                        <span className="text-accent">{booking.vehicle_type}</span>
                                    </div>
                                    <div className="text-muted text-sm">
                                        {new Date(booking.start_time).toLocaleString()} - {new Date(booking.end_time).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Raise Complaint */}
                <Card className="card">
                    <CardHeader className="bg-primary-dark">
                        <CardTitle className="text-2xl">Raise a Complaint</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-primary-light">
                        <form onSubmit={handleComplaint} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="complaint" className="text-secondary">Complaint Description</Label>
                                <textarea
                                    id="complaint"
                                    className="w-full bg-primary text-foreground border border-secondary rounded p-2"
                                    value={complaint}
                                    onChange={e => setComplaint(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="btn-secondary w-full">Submit Complaint</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
