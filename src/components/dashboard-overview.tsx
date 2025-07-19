"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, MapPin, Shield, Activity } from "lucide-react"

export function DashboardOverview() {
    const stats = [
        {
            title: "Registered Devices",
            value: "3",
            icon: Smartphone,
            change: "+1 this week",
            color: "text-pink-500",
        },
        {
            title: "Active Tracking",
            value: "2",
            icon: Activity,
            change: "Currently online",
            color: "text-green-500",
        },
        {
            title: "Locations Today",
            value: "47",
            icon: MapPin,
            change: "+12 from yesterday",
            color: "text-purple-500",
        },
        {
            title: "Security Alerts",
            value: "0",
            icon: Shield,
            change: "All clear",
            color: "text-blue-500",
        },
    ]

    const recentDevices = [
        { name: "iPhone 15 Pro", status: "Online", lastSeen: "2 min ago", battery: 85 },
        { name: "Samsung Galaxy S24", status: "Online", lastSeen: "5 min ago", battery: 92 },
        { name: "iPad Air", status: "Offline", lastSeen: "2 hours ago", battery: 45 },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Monitor your devices and tracking activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Device Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentDevices.map((device, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">{device.name}</p>
                                        <p className="text-sm text-gray-400">{device.lastSeen}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={device.status === "Online" ? "default" : "secondary"}
                                        className={device.status === "Online" ? "bg-green-600" : "bg-gray-600"}
                                    >
                                        {device.status}
                                    </Badge>
                                    <span className="text-sm text-gray-400">{device.battery}%</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <button className="w-full p-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors">
                            Register New Device
                        </button>
                        <button className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            View Location History
                        </button>
                        <button className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            Configure Alerts
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
