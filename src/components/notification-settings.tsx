"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin, Battery, Shield, Clock, Plus, Trash2 } from "lucide-react"

export function NotificationSettings() {
    const [notifications, setNotifications] = useState({
        locationAlerts: true,
        batteryAlerts: true,
        geofenceAlerts: true,
        offlineAlerts: true,
        speedAlerts: false,
        sosAlerts: true,
    })

    const geofences = [
        { id: 1, name: "Home", address: "123 Main St, Brooklyn, NY", radius: "100m", active: true },
        { id: 2, name: "Work", address: "456 Office Blvd, Manhattan, NY", radius: "50m", active: true },
        { id: 3, name: "School", address: "789 Education Ave, Queens, NY", radius: "200m", active: false },
    ]

    const recentAlerts = [
        { id: 1, type: "geofence", message: "iPhone 15 Pro left Home area", time: "2 hours ago", device: "iPhone 15 Pro" },
        {
            id: 2,
            type: "battery",
            message: "Samsung Galaxy S24 battery below 20%",
            time: "4 hours ago",
            device: "Samsung Galaxy S24",
        },
        { id: 3, type: "offline", message: "iPad Air went offline", time: "6 hours ago", device: "iPad Air" },
    ]

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notification Settings</h1>
                <p className="text-gray-400">Configure alerts and notification preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alert Types */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Alert Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-white font-medium">Location Alerts</p>
                                    <p className="text-sm text-gray-400">Notify when devices change location</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.locationAlerts}
                                onCheckedChange={() => toggleNotification("locationAlerts")}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Battery className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-white font-medium">Battery Alerts</p>
                                    <p className="text-sm text-gray-400">Notify when battery is low</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.batteryAlerts}
                                onCheckedChange={() => toggleNotification("batteryAlerts")}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-white font-medium">Geofence Alerts</p>
                                    <p className="text-sm text-gray-400">Notify when entering/leaving areas</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.geofenceAlerts}
                                onCheckedChange={() => toggleNotification("geofenceAlerts")}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-white font-medium">Offline Alerts</p>
                                    <p className="text-sm text-gray-400">Notify when devices go offline</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications.offlineAlerts}
                                onCheckedChange={() => toggleNotification("offlineAlerts")}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Thresholds */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Alert Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Battery Alert Threshold</label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    defaultValue="20"
                                    className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                                />
                                <span className="text-gray-400">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Offline Alert Delay</label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    defaultValue="15"
                                    className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                                />
                                <span className="text-gray-400">minutes</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">Speed Alert Threshold</label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    defaultValue="70"
                                    className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                                />
                                <span className="text-gray-400">mph</span>
                            </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                            Save Thresholds
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Geofences */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Geofences ({geofences.length})
                        </CardTitle>
                        <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Geofence
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {geofences.map((geofence) => (
                            <div key={geofence.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">{geofence.name}</p>
                                        <p className="text-sm text-gray-400">{geofence.address}</p>
                                        <p className="text-xs text-gray-500">Radius: {geofence.radius}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={geofence.active ? "default" : "secondary"}
                                        className={geofence.active ? "bg-green-600" : "bg-gray-600"}
                                    >
                                        {geofence.active ? "Active" : "Inactive"}
                                    </Badge>
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                                <div
                                    className={`w-2 h-2 rounded-full ${alert.type === "geofence"
                                            ? "bg-blue-500"
                                            : alert.type === "battery"
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                ></div>
                                <div className="flex-1">
                                    <p className="text-white text-sm">{alert.message}</p>
                                    <p className="text-xs text-gray-400">
                                        {alert.time} • {alert.device}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="bg-gray-600 text-xs">
                                    {alert.type}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
