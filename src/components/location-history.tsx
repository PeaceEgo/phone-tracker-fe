"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Filter, Download, Clock } from "lucide-react"
import { DynamicMapContainer, DynamicTileLayer, DynamicMarker, DynamicPopup, DynamicPolyline } from "./dynamic-map"

export function LocationHistory() {
    const [selectedDevice, setSelectedDevice] = useState("all")
    const [dateRange, setDateRange] = useState("today")
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const locationData = [
        {
            id: 1,
            device: "iPhone 15 Pro",
            location: "Central Park, New York",
            address: "Central Park West, New York, NY 10024",
            coordinates: { lat: 40.7829, lng: -73.9654 },
            timestamp: "2024-01-20 14:30:25",
            accuracy: "5m",
            battery: 85,
        },
        {
            id: 2,
            device: "iPhone 15 Pro",
            location: "Starbucks Coffee",
            address: "1585 Broadway, New York, NY 10036",
            coordinates: { lat: 40.7589, lng: -73.9851 },
            timestamp: "2024-01-20 12:15:10",
            accuracy: "3m",
            battery: 92,
        },
        {
            id: 3,
            device: "Samsung Galaxy S24",
            location: "Home",
            address: "123 Main Street, Brooklyn, NY 11201",
            coordinates: { lat: 40.6892, lng: -73.9442 },
            timestamp: "2024-01-20 09:45:33",
            accuracy: "8m",
            battery: 78,
        },
        {
            id: 4,
            device: "iPhone 15 Pro",
            location: "Times Square",
            address: "Times Square, New York, NY 10036",
            coordinates: { lat: 40.758, lng: -73.9855 },
            timestamp: "2024-01-20 08:20:15",
            accuracy: "12m",
            battery: 95,
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Location History</h1>
                <p className="text-gray-400">View detailed location timeline and history</p>
            </div>

            {/* Filters */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Device</label>
                            <select
                                value={selectedDevice}
                                onChange={(e) => setSelectedDevice(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Devices</option>
                                <option value="iphone">iPhone 15 Pro</option>
                                <option value="samsung">Samsung Galaxy S24</option>
                                <option value="ipad">iPad Air</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Search Location</label>
                            <Input
                                placeholder="Search addresses..."
                                className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                                Apply Filters
                            </Button>
                            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map View */}
                <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location History Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 rounded-lg overflow-hidden">
                            {isClient && (
                                <DynamicMapContainer
                                    center={[40.7829, -73.9654]}
                                    zoom={12}
                                    style={{ height: "100%", width: "100%" }}
                                    className="rounded-lg"
                                >
                                    <DynamicTileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {locationData.map((location) => (
                                        <DynamicMarker key={location.id} position={[location.coordinates.lat, location.coordinates.lng]}>
                                            <DynamicPopup>
                                                <div className="text-sm">
                                                    <p className="font-semibold">{location.location}</p>
                                                    <p className="text-gray-600">{location.address}</p>
                                                    <p className="text-xs text-gray-500">{location.timestamp}</p>
                                                    <p className="text-xs">Device: {location.device}</p>
                                                </div>
                                            </DynamicPopup>
                                        </DynamicMarker>
                                    ))}
                                    <DynamicPolyline
                                        positions={locationData.map((loc) => [loc.coordinates.lat, loc.coordinates.lng])}
                                        color="#ec4899"
                                        weight={3}
                                        opacity={0.7}
                                    />
                                </DynamicMapContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {locationData.map((location, index) => (
                                <div key={location.id} className="relative">
                                    {index !== locationData.length - 1 && (
                                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-600"></div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm">{location.location}</p>
                                            <p className="text-xs text-gray-400 truncate">{location.address}</p>
                                            <p className="text-xs text-gray-500 mt-1">{location.timestamp}</p>
                                            <Badge variant="secondary" className="text-xs mt-1 bg-gray-700">
                                                {location.device}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed History Table */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Detailed Location History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left text-gray-300 font-medium py-3">Device</th>
                                    <th className="text-left text-gray-300 font-medium py-3">Location</th>
                                    <th className="text-left text-gray-300 font-medium py-3">Address</th>
                                    <th className="text-left text-gray-300 font-medium py-3">Timestamp</th>
                                    <th className="text-left text-gray-300 font-medium py-3">Accuracy</th>
                                    <th className="text-left text-gray-300 font-medium py-3">Battery</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locationData.map((location) => (
                                    <tr key={location.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="py-3">
                                            <Badge variant="secondary" className="bg-gray-700">
                                                {location.device}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-white">{location.location}</td>
                                        <td className="py-3 text-gray-400 max-w-xs truncate">{location.address}</td>
                                        <td className="py-3 text-gray-400">{location.timestamp}</td>
                                        <td className="py-3 text-gray-400">{location.accuracy}</td>
                                        <td className="py-3 text-gray-400">{location.battery}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
