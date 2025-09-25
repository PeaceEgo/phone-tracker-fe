"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <span>Direct Registration</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-purple-300 font-medium mb-1 text-sm sm:text-base">Direct Registration</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
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
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <p className="text-red-400 text-xs sm:text-sm flex-1 min-w-0">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetError}
                className="ml-auto text-red-400 hover:text-red-300 h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0"
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
          <Label htmlFor="deviceName" className="text-gray-300 font-medium text-sm sm:text-base">
            Device Name
          </Label>
          <Input
            id="deviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Enter device name (e.g., Sarah's iPhone)"
            className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-10 sm:h-11 text-sm sm:text-base"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="deviceType" className="text-gray-300 font-medium text-sm sm:text-base">
            Device Type
          </Label>
          <Select value={deviceType} onValueChange={(value: "android" | "ios") => setDeviceType(value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20 h-10 w-full sm:h-11 text-sm sm:text-base cursor-pointer">
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="android" className="text-white hover:bg-gray-700">
                🤖 Android
              </SelectItem>
              <SelectItem value="ios" className="text-white hover:bg-gray-700">
                📱 iOS
              </SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="text-gray-300 font-medium text-sm sm:text-base">Device Location</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white transition-all duration-300 group disabled:opacity-50 h-10 sm:h-11 text-sm sm:text-base cursor-pointer flex items-center justify-center"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  <span className="truncate">Getting Location...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 " />
                  <span className="truncate cursor-pointer">Get Current Location</span>
                </>
              )}
            </Button>
            {currentLocation && (
              <Button
                type="button"
                onClick={resetLocation}
                variant="outline"
                className="text-gray-400 hover:text-white border-white/20 hover:border-white/40 h-10 sm:h-11 text-sm sm:text-base sm:flex-shrink-0"
              >
                Clear
              </Button>
            )}
          </div>
          {currentLocation && (
            <div className="text-xs sm:text-sm text-gray-400 mt-2 p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="flex items-center gap-2 mb-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <span className="text-green-400 font-medium">Location captured</span>
              </p>
              <p className="text-xs mb-1 break-all">
                Coordinates: {locationDisplay}
              </p>
              {currentLocation.accuracy && (
                <p className="text-xs mb-1 text-blue-400">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              )}
              <p className="text-xs text-purple-400">
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
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-700 hover:to-blue-800 text-white transition-all duration-300 group disabled:opacity-50 h-10 sm:h-12 text-sm sm:text-base"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                <span className="truncate">Registering Device...</span>
              </>
            ) : (
              <>
                <Link className="h-3 w-3 sm:h-4 sm:w-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="truncate">Register Device Directly</span>
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}