import React from 'react'
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Car, Bike } from 'lucide-react'

interface ParkingSlotCardProps {
    slotName: string
    isAvailable: boolean
    availableFrom: string
    vehicleType: 'car' | 'bike'
    bikeCount?: number
    onBookNow: () => void
}

export function ParkingSlotCard({
    slotName,
    isAvailable,
    availableFrom,
    vehicleType,
    bikeCount,
    onBookNow
}: ParkingSlotCardProps) {
    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getVehicleTypeText = () => {
        if (vehicleType === 'bike' && bikeCount !== undefined) {
            return `Bike (${bikeCount})`
        }
        return vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="bg-blue-100 p-4">
                    <h2 className="text-2xl font-bold text-blue-600">{slotName}</h2>
                    <p className="text-sm font-medium text-green-600">
                        {isAvailable ? `Available from ${formatTime(availableFrom)}` : 'Occupied'}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                        {getVehicleTypeText()}
                    </p>
                </div>
                <div className="p-4">
                    <Button
                        onClick={onBookNow}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!isAvailable}
                    >
                        Book Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}