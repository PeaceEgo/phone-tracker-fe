"use client"
import { motion } from "framer-motion"
import { MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Device {
  id: number
  name: string
  status: string
  location: string
  coordinates: { lat: number; lng: number; display: string }
  lastUpdate: string
  battery: number
  signal: string
  speed: string
  accuracy: string
  activity: string
  owner: string
}

interface FallbackMapProps {
  devices: Device[]
  height?: string
  onRetry?: () => void
}

export function FallbackMap({ devices, height = "h-[600px]", onRetry }: FallbackMapProps) {
  const activeDevices = devices.filter((device) => device.status === "online")

  return (
    <div className={`${height} w-full rounded-lg border border-white/10 bg-gray-900 relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">Map View</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Interactive map is loading. You can view device locations below.
          </p>

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent mb-6"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Interactive Map
            </Button>
          )}

          {/* Device list */}
          <div className="space-y-3 max-w-md">
            <h4 className="text-sm font-medium text-gray-300 text-left">Active Devices:</h4>
            {activeDevices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{device.name}</p>
                    <p className="text-gray-400 text-xs">{device.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-xs">{device.coordinates.display}</p>
                  <p className="text-gray-500 text-xs">{device.lastUpdate}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
