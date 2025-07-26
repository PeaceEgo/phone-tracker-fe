"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Smartphone, Plus, Trash2, Download, Shield, CheckCircle, Clock, Wifi } from 'lucide-react'

export function DeviceRegistration() {
  const [showQRCode, setShowQRCode] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("smartphone")
  const [isGenerating, setIsGenerating] = useState(false)

  const registeredDevices = [
    { 
      id: 1, 
      name: "iPhone 15 Pro", 
      type: "iOS", 
      status: "Active", 
      registered: "2024-01-15",
      lastSeen: "2 min ago",
      battery: 85,
      location: "Home"
    },
    { 
      id: 2, 
      name: "Samsung Galaxy S24", 
      type: "Android", 
      status: "Active", 
      registered: "2024-01-10",
      lastSeen: "5 min ago",
      battery: 92,
      location: "Office"
    },
    { 
      id: 3, 
      name: "iPad Air", 
      type: "iOS", 
      status: "Inactive", 
      registered: "2024-01-05",
      lastSeen: "2 hours ago",
      battery: 45,
      location: "Unknown"
    },
  ]

  const setupSteps = [
    {
      number: 1,
      title: "Download the App",
      description: "Install TrackGuard on the target device",
      icon: Download,
    },
    {
      number: 2,
      title: "Scan QR Code",
      description: "Use the generated QR code to link the device",
      icon: QrCode,
    },
    {
      number: 3,
      title: "Grant Permissions",
      description: "Allow location and notification access",
      icon: Shield,
    },
    {
      number: 4,
      title: "Start Tracking",
      description: "Device will appear in your dashboard",
      icon: CheckCircle,
    },
  ]

  const handleGenerateQR = async () => {
    setIsGenerating(true)
    // Simulate QR generation delay
    setTimeout(() => {
      setShowQRCode(true)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Add gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />
      
      {/* Add floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
            Device Registration
          </h1>
          <p className="text-gray-400 text-lg">Register and manage your tracked devices with ease</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-400" />
                  </div>
                  Register New Device
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="deviceName" className="text-gray-300 font-medium">
                    Device Name
                  </Label>
                  <Input
                    id="deviceName"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Enter device name (e.g., Sarah's iPhone)"
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="deviceType" className="text-gray-300 font-medium">
                    Device Type
                  </Label>
                  <select
                    id="deviceType"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="smartphone" className="bg-gray-800">Smartphone</option>
                    <option value="tablet" className="bg-gray-800">Tablet</option>
                    <option value="laptop" className="bg-gray-800">Laptop</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={handleGenerateQR}
                    disabled={isGenerating || !deviceName}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 group disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300"
                  >
                    Manual Setup
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {showQRCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="w-40 h-40 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center shadow-lg"
                        >
                          <QrCode className="h-24 w-24 text-gray-800" />
                        </motion.div>
                        <p className="text-white font-medium mb-1">Scan this QR code with your device</p>
                        <p className="text-sm text-gray-400 mb-3">Code expires in 10 minutes</p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Auto-refresh in 9:45
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Setup Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {setupSteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="w-4 h-4 text-blue-400" />
                        <p className="text-white font-semibold">{step.title}</p>
                      </div>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Registered Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-400" />
                </div>
                Registered Devices
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {registeredDevices.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registeredDevices.map((device, index) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Smartphone className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{device.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{device.type}</span>
                          <span>•</span>
                          <span>Registered {device.registered}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {device.lastSeen}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-300">{device.battery}% battery</p>
                        <p className="text-gray-400">{device.location}</p>
                      </div>
                      <Badge
                        variant={device.status === "Active" ? "default" : "secondary"}
                        className={
                          device.status === "Active"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          device.status === "Active" ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`} />
                        {device.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
