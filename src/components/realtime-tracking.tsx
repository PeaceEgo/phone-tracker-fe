"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Radio, MapPin, Battery, Wifi, Play, Pause, RefreshCw } from "lucide-react"
import { DynamicMapContainer, DynamicTileLayer, DynamicMarker, DynamicPopup } from "./dynamic-map"

export function RealTimeTracking() {
    const [isTracking, setIsTracking] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const devices = [
        {
            id: 1,
            name: "iPhone 15 Pro",
            status: "online",
            location: "Central Park, New York",
            coordinates: { lat: 40.7829, lng: -73.9654, display: "40.7829° N, 73.9654° W" },
            lastUpdate: "2 seconds ago",
            battery: 85,
            signal: "Strong",
            speed: "0 mph",
            accuracy: "5m",
        },
        {
            id: 2,
            name: "Samsung Galaxy S24",
            status: "online",
            location: "Brooklyn Bridge",
            coordinates: { lat: 40.7061, lng: -73.9969, display: "40.7061° N, 73.9969° W" },
            lastUpdate: "5 seconds ago",
            battery: 92,
            signal: "Strong",
            speed: "25 mph",
            accuracy: "3m",
        },
        {
            id: 3,
            name: "iPad Air",
            status: "offline",
            location: "Home",
            coordinates: { lat: 40.6782, lng: -73.9442, display: "40.6782° N, 73.9442° W" },
            lastUpdate: "2 hours ago",
            battery: 45,
            signal: "Weak",
            speed: "0 mph",
            accuracy: "12m",
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Real-time Tracking</h1>
                <p className="text-gray-400">Monitor device locations and status in real-time</p>
            </div>

            {/* Control Panel */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Radio className="h-5 w-5" />
                        Tracking Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={isTracking}
                                onCheckedChange={setIsTracking}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                            <span className="text-white">Real-time Tracking</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                checked={autoRefresh}
                                onCheckedChange={setAutoRefresh}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                            <span className="text-white">Auto Refresh (30s)</span>
                        </div>

                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Now
                        </Button>

                        <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                            {isTracking ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            {isTracking ? "Pause All" : "Start All"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Live Map */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Live Tracking Map
                        </CardTitle>
                        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
                            <div
                                className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
                            ></div>
                            <span className="text-sm text-white">{isTracking ? "Live" : "Paused"}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden">
                        {isClient && (
                            <DynamicMapContainer
                                center={[40.7589, -73.9851]}
                                zoom={11}
                                style={{ height: "100%", width: "100%" }}
                                className="rounded-lg"
                            >
                                <DynamicTileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {devices
                                    .filter((device) => device.status === "online")
                                    .map((device) => (
                                        <DynamicMarker key={device.id} position={[device.coordinates.lat, device.coordinates.lng]}>
                                            <DynamicPopup>
                                                <div className="text-sm">
                                                    <p className="font-semibold">{device.name}</p>
                                                    <p className="text-gray-600">{device.location}</p>
                                                    <p className="text-xs text-gray-500">Battery: {device.battery}%</p>
                                                    <p className="text-xs text-gray-500">Speed: {device.speed}</p>
                                                    <p className="text-xs text-gray-500">Last update: {device.lastUpdate}</p>
                                                </div>
                                            </DynamicPopup>
                                        </DynamicMarker>
                                    ))}
                            </DynamicMapContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Device Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <Card key={device.id} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-lg">{device.name}</CardTitle>
                                <Badge
                                    variant={device.status === "online" ? "default" : "secondary"}
                                    className={`${device.status === "online" ? "bg-green-600" : "bg-gray-600"} flex items-center gap-1`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${device.status === "online" ? "bg-green-300 animate-pulse" : "bg-gray-400"}`}
                                    ></div>
                                    {device.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-white text-sm">{device.location}</span>
                                </div>
                                <p className="text-xs text-gray-400 ml-6">{device.coordinates.display}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Battery</p>
                                    <div className="flex items-center gap-2">
                                        <Battery className="h-4 w-4 text-gray-400" />
                                        <span className="text-white">{device.battery}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400">Signal</p>
                                    <div className="flex items-center gap-2">
                                        <Wifi className="h-4 w-4 text-gray-400" />
                                        <span className="text-white">{device.signal}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400">Speed</p>
                                    <span className="text-white">{device.speed}</span>
                                </div>
                                <div>
                                    <p className="text-gray-400">Accuracy</p>
                                    <span className="text-white">{device.accuracy}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-700">
                                <p className="text-xs text-gray-400">Last update: {device.lastUpdate}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    Locate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                                >
                                    History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
