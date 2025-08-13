"use client"

import { Button } from "@/components/ui/button"
import { MapPin, RefreshCw } from "lucide-react"

interface Device {
  id: string
  name: string
  status: string
  location: string
  coordinates: { lat: number; lng: number; display: string }
  lastUpdate: string
}

interface FallbackMapProps {
  devices: Device[]
  height?: string
  onRetry: () => void
}

export function FallbackMap({ devices, height = "h-[600px]", onRetry }: FallbackMapProps) {
  const activeDevices = devices.filter((device) => device.status === "online")

  return (
    <div
      className={`${height} w-full rounded-lg border border-white/10 bg-gray-900 relative flex flex-col items-center justify-center p-6 text-center`}
    >
      <div className="p-4 bg-red-500/20 rounded-full mb-4">
        <MapPin className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Map Loading Failed</h3>
      <p className="text-gray-400 mb-6 max-w-md">
        We couldn't load the map component. This could be due to network issues or browser compatibility.
      </p>

      <div className="mb-8">
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Loading Map
        </Button>
      </div>

      <div className="w-full max-w-md">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Active Device Locations ({activeDevices.length})</h4>
        <div className="space-y-2">
          {activeDevices.map((device) => (
            <div key={device.id} className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-white">{device.name}</span>
              </div>
              <div className="mt-1 text-sm text-gray-400">{device.location}</div>
              <div className="mt-1 text-xs text-gray-500">{device.coordinates.display}</div>
            </div>
          ))}

          {activeDevices.length === 0 && (
            <div className="bg-white/5 p-4 rounded-lg text-gray-400 text-sm">No active devices to display</div>
          )}
        </div>
      </div>
    </div>
  )
}
