"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Socket } from "socket.io-client"
import * as L from "leaflet"
import { LocationUpdate, Device } from "./realtime-tracking" 

// WebSocket event interfaces
interface ServerToClientEvents {
  locationUpdate: (payload: LocationUpdate) => void;
  deviceNotification: (payload: LocationUpdate) => void;
  trackingStarted: (data: { deviceId: string; message: string; timestamp: string }) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect_attempt: (attemptNumber: number) => void;
  reconnect_failed: () => void;
  reconnect: (attemptNumber: number) => void;
  pong: () => void;
}

interface ClientToServerEvents {
  watchDevice: (data: { deviceId: string }) => void;
  ping: () => void;
}

interface TrackingMapProps {
  devices: Device[]
  height?: string
  showTrails?: boolean
  onDeviceClick?: (device: Device) => void
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  watchedDeviceIds: string[]
}

export function TrackingMap({
  devices,
  height = "h-[600px]",
  showTrails = false,
  onDeviceClick,
  socket,
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const trailsRef = useRef<Map<string, L.Polyline>>(new Map())

  // Stable utility functions that don't depend on props/state
  const formatCoordinates = useCallback((lat: number, lng: number): string => {
    return `${lat.toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${
      lng >= 0 ? "E" : "W"
    }`
  }, [])

  const formatLastUpdate = useCallback((updatedAt: string): string => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000)
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  }, [])

  // Create custom marker icon - stable function
  const createMarkerIcon = useCallback((isOnline: boolean = true) => {
    const color = isOnline ? "#10b981" : "#6b7280" // Green for online, gray for offline
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            ${isOnline ? 'animation: pulse 2s infinite;' : ''}
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      `,
      className: "custom-marker",
      iconSize: [20, 20] as [number, number],
      iconAnchor: [10, 10] as [number, number],
    })
  }, [])

  // Create popup content - stable function
  const createPopupContent = useCallback((device: Device, lat: number, lng: number, lastUpdate: string) => {
    return `
      <div style="min-width: 200px; font-family: system-ui;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px;">
          ${device.name}
        </div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 12px;">
          ${device.locationName || device.location}
        </div>
        <div style="display: grid; gap: 8px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500;">Status:</span>
            <span style="color: ${device.status === 'online' ? '#059669' : '#6b7280'};">
              ${device.status.toUpperCase()}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500;">Coordinates:</span>
            <span>${formatCoordinates(lat, lng)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500;">Last update:</span>
            <span style="color: ${device.status === 'online' ? '#059669' : '#6b7280'};">${lastUpdate}</span>
          </div>
        </div>
      </div>
    `
  }, [formatCoordinates])

  // Update trail polyline - stable function
  const updateTrail = useCallback((deviceId: string, trail: Array<{ lat: number; lng: number; timestamp: string }>) => {
    if (!map || !trail || trail.length < 2) return

    console.log(`🛤️ Updating trail for device ${deviceId} with ${trail.length} points`)

    // Remove existing trail
    const existingTrail = trailsRef.current.get(deviceId)
    if (existingTrail) {
      map.removeLayer(existingTrail)
    }

    // Create new trail polyline
    const coordinates = trail.map(point => [point.lat, point.lng] as [number, number])
    const polyline = L.polyline(coordinates, {
      color: "#3b82f6",
      weight: 3,
      opacity: 0.7,
      smoothFactor: 1,
    }).addTo(map)

    trailsRef.current.set(deviceId, polyline)
  }, [map])

  // Update marker position and info - now includes all dependencies
  const updateMarker = useCallback((deviceId: string, lat: number, lng: number, device: Device, lastUpdate: string) => {
    if (!map) return

    console.log(`🎯 Updating marker for device ${deviceId} at [${lat}, ${lng}]`)

    const marker = markersRef.current.get(deviceId)
    if (marker) {
      // Update existing marker
      marker.setLatLng([lat, lng])
      marker.setIcon(createMarkerIcon(device.status === 'online'))
      
      const popupContent = createPopupContent(device, lat, lng, lastUpdate)
      marker.setPopupContent(popupContent)
      
      console.log(`✅ Updated existing marker for ${deviceId}`)
    } else {
      // Create new marker
      console.log(`🆕 Creating new marker for ${deviceId}`)
      
      const newMarker = L.marker([lat, lng], {
        icon: createMarkerIcon(device.status === 'online')
      }).addTo(map)

      const popupContent = createPopupContent(device, lat, lng, lastUpdate)
      newMarker.bindPopup(popupContent, {
        maxWidth: 250,
        className: "custom-popup",
      })

      if (onDeviceClick) {
        newMarker.on("click", () => {
          console.log(`🖱️ Marker clicked for device: ${deviceId}`)
          onDeviceClick(device)
        })
      }

      markersRef.current.set(deviceId, newMarker)
    }

    // Update trail if enabled
    if (showTrails && device.trail && device.trail.length > 1) {
      updateTrail(deviceId, device.trail)
    }
  }, [map, onDeviceClick, showTrails, createMarkerIcon, createPopupContent, updateTrail])

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (mapInstanceRef.current) {
          setMap(mapInstanceRef.current)
          setIsLoading(false)
          return
        }

        if (typeof window !== "undefined") {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Fix default marker icons - Fixed TypeScript error
        const DefaultIcon = L.Icon.Default
        delete (DefaultIcon.prototype as unknown as Record<string, unknown>)._getIconUrl
        DefaultIcon.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstanceRef.current) {
          console.log("🗺️ Initializing Leaflet map...")

          const newMapInstance = L.map(mapRef.current, {
            center: [40.7589, -73.9851] as [number, number], 
            zoom: 11,
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: true,
          })

          const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            tileSize: 256,
            zoomOffset: 0,
            crossOrigin: true,
          })

          tileLayer.on("tileerror", (e: L.TileErrorEvent) => {
            console.warn("Tile loading error:", e)
          })

          tileLayer.addTo(newMapInstance)

          mapInstanceRef.current = newMapInstance
          setMap(newMapInstance)
          setIsLoading(false)

          console.log("✅ Map initialized successfully")
        }
      } catch (err) {
        console.error("❌ Error initializing map:", err)
        setError("Failed to load map")
        setIsLoading(false)
      }
    }

    if (mapRef.current) {
      initializeMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        console.log("🧹 Cleaning up map instance")
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMap(null)
      }
    }
  }, [])

  // Handle WebSocket location updates - moved formatLastUpdate inside
  useEffect(() => {
    if (!socket || !map) {
      console.log("⚠️ Socket or map not available for location updates")
      return
    }

    console.log("🔌 Setting up WebSocket location update handlers for map")

    const handleLocationUpdate = (payload: LocationUpdate) => {
      console.log("📍 Map received location update:", payload)
      
      try {
        const { deviceId, location, updatedAt } = payload

        // Extract coordinates
        let lat: number, lng: number
        if (location.latitude !== undefined && location.longitude !== undefined) {
          lat = location.latitude
          lng = location.longitude
        } else {
          lng = location.coordinates[0]
          lat = location.coordinates[1]
        }

        console.log(`📊 Extracted coordinates for ${deviceId}: [${lat}, ${lng}]`)

        // Find the device in our list
        const device = devices.find((d) => d.deviceId === deviceId)
        if (!device) {
          console.warn(`⚠️ Device ${deviceId} not found in devices list`)
          return
        }

        // Update the marker on the map
        updateMarker(deviceId, lat, lng, device, formatLastUpdate(updatedAt))

        // Auto-fit map bounds if this is a new location
        const bounds = L.latLngBounds(
          Array.from(markersRef.current.values()).map((marker) => marker.getLatLng())
        )
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1))
        }

        console.log(`✅ Map updated for device ${deviceId}`)
      } catch (err) {
        console.error("❌ Error handling location update in map:", err)
      }
    }

    const handleDeviceNotification = (payload: LocationUpdate) => {
      console.log("🔔 Map received device notification:", payload)
      if (payload.location) {
        handleLocationUpdate(payload)
      }
    }

    // Register event listeners
    socket.on("locationUpdate", handleLocationUpdate)
    socket.on("deviceNotification", handleDeviceNotification)

    console.log("✅ WebSocket event handlers registered for map")

    return () => {
      console.log("🧹 Cleaning up WebSocket event handlers for map")
      socket.off("locationUpdate", handleLocationUpdate)
      socket.off("deviceNotification", handleDeviceNotification)
    }
  }, [socket, map, devices, updateMarker, formatLastUpdate])

  // Update markers when devices change (initial load and status updates)
  useEffect(() => {
    if (!map || !devices.length) {
      console.log("⚠️ Map or devices not available for initial marker setup")
      return
    }

    console.log(`🎯 Setting up initial markers for ${devices.length} devices`)

    const updateAllMarkers = () => {
      try {
        // Remove markers for devices no longer in the list
        markersRef.current.forEach((marker, deviceId) => {
          if (!devices.some((d) => d.deviceId === deviceId)) {
            console.log(`🗑️ Removing marker for device ${deviceId}`)
            map.removeLayer(marker)
            markersRef.current.delete(deviceId)
          }
        })

        // Remove trails for devices no longer in the list
        trailsRef.current.forEach((trail, deviceId) => {
          if (!devices.some((d) => d.deviceId === deviceId)) {
            console.log(`🗑️ Removing trail for device ${deviceId}`)
            map.removeLayer(trail)
            trailsRef.current.delete(deviceId)
          }
        })

        // Update markers for all devices with valid coordinates
        const devicesWithCoordinates = devices.filter((device) => 
          device.coordinates.lat !== 0 || device.coordinates.lng !== 0
        )
        
        console.log(`📍 Found ${devicesWithCoordinates.length} devices with coordinates`)

        if (devicesWithCoordinates.length === 0) {
          console.log("⚠️ No devices with valid coordinates found")
          return
        }

        const bounds = L.latLngBounds([])

        devicesWithCoordinates.forEach((device) => {
          const { lat, lng } = device.coordinates
          bounds.extend([lat, lng])

          updateMarker(device.deviceId, lat, lng, device, device.lastUpdate)
        })

        // Fit map to show all markers
        if (bounds.isValid() && devicesWithCoordinates.length > 0) {
          console.log("🎯 Fitting map bounds to show all devices")
          map.fitBounds(bounds.pad(0.1))
        }

        console.log(`✅ Initial markers setup complete for ${devicesWithCoordinates.length} devices`)
      } catch (err) {
        console.error("❌ Error updating markers:", err)
      }
    }

    updateAllMarkers()
  }, [map, devices, updateMarker])

  if (error) {
    return (
      <div className="relative">
        <div
          className={`${height} w-full rounded-lg border border-white/10 bg-gray-900 flex items-center justify-center`}
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm">Failed to load map</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`${height} w-full rounded-lg border border-white/10 bg-gray-900 relative z-0`}
        style={{ minHeight: "400px" }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <motion.div
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <p className="text-gray-400 text-sm">Loading map...</p>
            <p className="text-gray-500 text-xs mt-1">Initializing Leaflet...</p>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {socket && (
        <div className="absolute top-4 right-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
            socket.connected 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              socket.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs text-white">
              {socket.connected ? 'Live Updates' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}

      {/* Device Counter */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-xs text-gray-300">
            Tracking: {devices.filter(d => d.status === 'online').length}/{devices.length} devices
          </span>
        </div>
      </div>

      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          background: #111827 !important;
          border-radius: 8px;
        }
        .leaflet-tile {
          filter: brightness(0.9) contrast(1.1);
        }
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.7) !important;
          color: white !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #60a5fa !important;
        }
        .leaflet-control-zoom {
          border: none !important;
        }
        .leaflet-control-zoom a {
          background: rgba(0, 0, 0, 0.7) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}