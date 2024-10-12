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

    const getAvailabilityText = () => {
        if (isAvailable) {
            return vehicleType === 'bike' && bikeCount === 1
                ? `Available for 1 more bike`
                : `Available now`
        } else {
            return `Next available: ${formatTime(availableFrom)}`
        }
    }

    const getVehicleTypeText = () => {
        if (vehicleType === 'bike') {
            return `Bike (${bikeCount !== undefined ? bikeCount : 0}/2)`
        }
        return vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="bg-blue-100 p-4">
                    <h2 className="text-2xl font-bold text-blue-600">{slotName}</h2>
                    <p className="text-sm font-medium text-green-600">
                        {getAvailabilityText()}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                        {getVehicleTypeText()}
                    </p>
                </div>
                <div className="p-4">
                    <Button
                        onClick={onBookNow}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Book Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
