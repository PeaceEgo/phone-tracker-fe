"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, Link, Settings } from 'lucide-react'
import { toast } from "sonner"
import { useDeviceRegistration } from "@/hooks/use-device-registration"

interface DirectRegistrationProps {
  onDeviceRegistered: () => void
}

export function DirectRegistration({ onDeviceRegistered }: DirectRegistrationProps) {
  const {
    isRegistering,
    isGettingLocation,
    currentLocation,
    error,
    getCurrentLocation,
    registerDevice,
    resetLocation,
    resetError,
  } = useDeviceRegistration()

  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState<"android" | "ios">("android")

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation()
      toast.success("Current location has been set")
    } catch (error) {
      console.error("Error getting location:", error)
      toast.error(error instanceof Error ? error.message : "Unable to get current location")
    }
  }

  const handleRegisterDevice = async () => {
    if (!currentLocation) {
      toast.error("Please set device location before registering")
      return
    }
    if (!deviceName.trim()) {
      toast.error("Please enter a device name")
      return
    }

    try {
      const newDevice = await registerDevice(deviceName, deviceType, currentLocation)
      
      toast.success("Device registered successfully")
      
      // Show the reverse geocoded address if available
      if (newDevice.locationName) {
        toast.success(`📍 Address: ${newDevice.locationName}`)
      }
      
      // Reset form
      setDeviceName("")
      resetLocation()
      
      // Refresh device list
      onDeviceRegistered()
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Unable to register device")
    }
  }

  const locationDisplay = currentLocation 
    ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
    : ""

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-xl">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Settings className="h-5 w-5 text-purple-400" />
          </div>
          Direct Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="text-purple-300 font-medium mb-1">Direct Registration</h3>
              <p className="text-sm text-gray-400">
                Manually enter device details and location. The address will be automatically 
                detected using your coordinates via reverse geocoding.
              </p>
            </div>
          </div>
        </div>

        {/* Show error message if any */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetError}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="deviceType" className="text-gray-300 font-medium">
            Device Type
          </Label>
          <select
            id="deviceType"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as "android" | "ios")}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="android" className="bg-gray-800">
              Android
            </option>
            <option value="ios" className="bg-gray-800">
              iOS
            </option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="text-gray-300 font-medium">Device Location</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 group disabled:opacity-50"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current Location
                </>
              )}
            </Button>
            {currentLocation && (
              <Button
                type="button"
                onClick={resetLocation}
                variant="outline"
                className="text-gray-400 hover:text-white border-white/20 hover:border-white/40"
              >
                Clear
              </Button>
            )}
          </div>
          {currentLocation && (
            <div className="text-sm text-gray-400 mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Location captured</span>
              </p>
              <p className="text-xs mt-1">
                Coordinates: {locationDisplay}
              </p>
              {currentLocation.accuracy && (
                <p className="text-xs mt-1 text-blue-400">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              )}
              <p className="text-xs text-purple-400 mt-1">
                📍 Address will be automatically detected when registering
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleRegisterDevice}
            disabled={isRegistering || !deviceName.trim() || !currentLocation}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white transition-all duration-300 group disabled:opacity-50"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering Device...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Register Device Directly
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}