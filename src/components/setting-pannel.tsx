"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Shield, Download, Trash2, Key, Mail } from "lucide-react"

export function SettingsPanel() {
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
    })

    const [privacy, setPrivacy] = useState({
        dataSharing: false,
        analytics: true,
        locationHistory: true,
        notifications: true,
    })

    const sessions = [
        { id: 1, device: "iPhone 15 Pro", location: "New York, NY", lastActive: "Active now", current: true },
        { id: 2, device: "MacBook Pro", location: "New York, NY", lastActive: "2 hours ago", current: false },
        { id: 3, device: "iPad Air", location: "Brooklyn, NY", lastActive: "1 day ago", current: false },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account and privacy preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
                            />
                        </div>

                        <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                            Update Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security & Authentication
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                        </Button>

                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                            <Shield className="h-4 w-4 mr-2" />
                            Enable Two-Factor Authentication
                        </Button>

                        <div className="pt-4 border-t border-gray-700">
                            <h4 className="text-white font-medium mb-3">Login Notifications</h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-300">Email notifications for new logins</p>
                                    <p className="text-xs text-gray-400">Get notified when someone logs into your account</p>
                                </div>
                                <Switch
                                    defaultChecked
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Privacy Settings */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Privacy Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Data Sharing</p>
                            <p className="text-sm text-gray-400">Share anonymized data to improve services</p>
                        </div>
                        <Switch
                            checked={privacy.dataSharing}
                            onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, dataSharing: checked }))}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Analytics</p>
                            <p className="text-sm text-gray-400">Help improve the app with usage analytics</p>
                        </div>
                        <Switch
                            checked={privacy.analytics}
                            onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, analytics: checked }))}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Location History</p>
                            <p className="text-sm text-gray-400">Store location data for historical tracking</p>
                        </div>
                        <Switch
                            checked={privacy.locationHistory}
                            onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, locationHistory: checked }))}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-purple-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">{session.device}</p>
                                        <p className="text-sm text-gray-400">
                                            {session.location} • {session.lastActive}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {session.current && <Badge className="bg-green-600">Current</Badge>}
                                    {!session.current && (
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>

                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                            <Mail className="h-4 w-4 mr-2" />
                            Request Data Report
                        </Button>

                        <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Data exports include location history, device information, and account settings. Account deletion is
                            permanent and cannot be undone.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
