"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, Link, Settings } from 'lucide-react'
import { toast } from "sonner"
import { useDevicesStore } from "@/store/devices"

interface DirectRegistrationProps {
  onDeviceRegistered: () => void
}

export function DirectRegistration({ onDeviceRegistered }: DirectRegistrationProps) {
  const { addDevice } = useDevicesStore()
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState<"android" | "ios">("android")
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [locationName, setLocationName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude, 
          position.coords.latitude
        ]
        setLocation(coords)
        setLocationName(
          `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        )
        setIsGettingLocation(false)
        toast.success("Current location has been set")
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Unable to get current location. Please enter coordinates manually.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  const registerDevice = async () => {
    if (!location) {
      toast.error("Please set device location before registering")
      return
    }
    if (!deviceName.trim()) {
      toast.error("Please enter a device name")
      return
    }

    setIsRegistering(true)
    try {
      const payload = {
        name: deviceName,
        type: deviceType,
        location: {
          type: "Point",
          coordinates: location,
        },
        locationName,
        registrationMethod: "direct",
      }

      const response = await fetch("https://phone-tracker-be.onrender.com/api/devices/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Device registration failed")
      }

      const data = await response.json()
      addDevice(data.device) // Add to Zustand store
      toast.success(data.message || "Device registered successfully")
      
      // Reset form
      setDeviceName("")
      setLocation(null)
      setLocationName("")
      
      // Refresh device list
      onDeviceRegistered()
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(
        error instanceof Error ? error.message : "Unable to register device"
      )
    } finally {
      setIsRegistering(false)
    }
  }

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
                Manually enter device details and location. Use this when you have physical access to
                configure the device yourself.
              </p>
            </div>
          </div>
        </div>

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
              onClick={getCurrentLocation}
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
          </div>
          {location && (
            <div className="text-sm text-gray-400 mt-2">
              <p>📍 {locationName}</p>
              <p className="text-xs">
                Coordinates: {location[1].toFixed(6)}, {location[0].toFixed(6)}
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
            onClick={registerDevice}
            disabled={isRegistering || !deviceName.trim() || !location}
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