"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Smartphone, Plus, Trash2 } from "lucide-react"

export function DeviceRegistration() {
    const [showQRCode, setShowQRCode] = useState(false)
    const [deviceName, setDeviceName] = useState("")
    const [deviceType, setDeviceType] = useState("smartphone")

    const registeredDevices = [
        { id: 1, name: "iPhone 15 Pro", type: "iOS", status: "Active", registered: "2024-01-15" },
        { id: 2, name: "Samsung Galaxy S24", type: "Android", status: "Active", registered: "2024-01-10" },
        { id: 3, name: "iPad Air", type: "iOS", status: "Inactive", registered: "2024-01-05" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Device Registration</h1>
                <p className="text-gray-400">Register and manage your tracked devices</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registration Form */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Register New Device
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="deviceName" className="text-gray-300">
                                Device Name
                            </Label>
                            <Input
                                id="deviceName"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                placeholder="Enter device name"
                                className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deviceType" className="text-gray-300">
                                Device Type
                            </Label>
                            <select
                                id="deviceType"
                                value={deviceType}
                                onChange={(e) => setDeviceType(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="smartphone">Smartphone</option>
                                <option value="tablet">Tablet</option>
                                <option value="laptop">Laptop</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowQRCode(!showQRCode)}
                                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                            >
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate QR Code
                            </Button>
                            <Button className="flex-1 bg-gray-700 hover:bg-gray-600">Manual Setup</Button>
                        </div>

                        {showQRCode && (
                            <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center">
                                <div className="w-32 h-32 bg-white mx-auto mb-3 rounded-lg flex items-center justify-center">
                                    <QrCode className="h-16 w-16 text-gray-800" />
                                </div>
                                <p className="text-sm text-gray-300">Scan this QR code with your device</p>
                                <p className="text-xs text-gray-400 mt-1">Code expires in 10 minutes</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Setup Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    1
                                </div>
                                <div>
                                    <p className="text-white font-medium">Download the App</p>
                                    <p className="text-sm text-gray-400">Install Phone Tracker on the target device</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    2
                                </div>
                                <div>
                                    <p className="text-white font-medium">Scan QR Code</p>
                                    <p className="text-sm text-gray-400">Use the generated QR code to link the device</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    3
                                </div>
                                <div>
                                    <p className="text-white font-medium">Grant Permissions</p>
                                    <p className="text-sm text-gray-400">Allow location and notification access</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    4
                                </div>
                                <div>
                                    <p className="text-white font-medium">Start Tracking</p>
                                    <p className="text-sm text-gray-400">Device will appear in your dashboard</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registered Devices */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Registered Devices ({registeredDevices.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {registeredDevices.map((device) => (
                            <div key={device.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">{device.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {device.type} • Registered {device.registered}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={device.status === "Active" ? "default" : "secondary"}
                                        className={device.status === "Active" ? "bg-green-600" : "bg-gray-600"}
                                    >
                                        {device.status}
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
        </div>
    )
}
