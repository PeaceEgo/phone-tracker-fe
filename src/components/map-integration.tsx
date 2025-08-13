"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { FallbackMap } from "./fallback-map"

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

interface TrackingMapProps {
  devices: Device[]
  height?: string
  showTrails?: boolean
  onDeviceClick?: (device: Device) => void
}

export function TrackingMap({ devices, height = "h-[600px]", showTrails = false, onDeviceClick }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mapInstance: any = null

    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic imports for Leaflet
        const L = await import("leaflet")

        // Import CSS using a different approach
        if (typeof window !== "undefined") {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Fix for default markers
        const DefaultIcon = L.Icon.Default as any
        delete DefaultIcon.prototype._getIconUrl
        DefaultIcon.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstance) {
          // Initialize map
          mapInstance = L.map(mapRef.current, {
            center: [40.7589, -73.9851] as [number, number],
            zoom: 11,
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: true,
          })

          // Add tile layer with better error handling
          const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            tileSize: 256,
            zoomOffset: 0,
            crossOrigin: true,
          })

          tileLayer.on("tileerror", (e: any) => {
            console.warn("Tile loading error:", e)
          })

          tileLayer.addTo(mapInstance)

          setMap(mapInstance)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Failed to load map")
        setIsLoading(false)
      }
    }

    if (mapRef.current) {
      initializeMap()
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
      }
    }
  }, [])

  // Update markers when devices change
  useEffect(() => {
    if (!map || !devices) return

    const updateMarkers = async () => {
      try {
        const L = await import("leaflet")

        // Clear existing markers
        map.eachLayer((layer: any) => {
          if (layer.options && layer.options.isCustomMarker) {
            map.removeLayer(layer)
          }
        })

        // Add new markers
        const activeDevices = devices.filter((device) => device.status === "online")
        const markers: any[] = []

        activeDevices.forEach((device) => {
          // Create custom icon based on device status
          const iconColor = device.status === "online" ? "#10b981" : "#6b7280"

          const customIcon = L.divIcon({
            html: `
              <div style="
                background-color: ${iconColor};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: white;
                  border-radius: 50%;
                  ${device.status === "online" ? "animation: pulse 2s infinite;" : ""}
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

          const marker = L.marker(
            [device.coordinates.lat, device.coordinates.lng] as [number, number],
            {
              icon: customIcon,
              isCustomMarker: true, // Custom property to identify our markers
            } as any,
          ).addTo(map)

          markers.push(marker)

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px; font-family: system-ui;">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px;">
                ${device.name}
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-bottom: 12px;">
                ${device.location}
              </div>
              <div style="display: grid; gap: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 500;">Owner:</span>
                  <span>${device.owner}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 500;">Battery:</span>
                  <span style="color: ${device.battery > 20 ? "#059669" : "#dc2626"};">
                    ${device.battery}%
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 500;">Speed:</span>
                  <span>${device.speed}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 500;">Activity:</span>
                  <span style="color: ${device.activity === "Moving" ? "#2563eb" : "#6b7280"};">
                    ${device.activity}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 500;">Last update:</span>
                  <span style="color: #059669;">${device.lastUpdate}</span>
                </div>
              </div>
            </div>
          `

          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: "custom-popup",
          })

          // Add click handler
          if (onDeviceClick) {
            marker.on("click", () => onDeviceClick(device))
          }
        })

        // Add trails if requested
        if (showTrails && activeDevices.length > 1) {
          const coordinates = activeDevices.map(
            (device) => [device.coordinates.lat, device.coordinates.lng] as [number, number],
          )

          const polyline = L.polyline(coordinates, {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(map)
        }

        // Fit map to show all markers if there are any
        if (markers.length > 0) {
          const group = L.featureGroup(markers)
          map.fitBounds(group.getBounds().pad(0.1))
        }
      } catch (err) {
        console.error("Error updating markers:", err)
      }
    }

    updateMarkers()
  }, [map, devices, onDeviceClick, showTrails])

  if (error) {
    // return (
    //   // <FallbackMap
    //   //   devices={devices}
    //   //   height={height}
    //   //   onRetry={() => {
    //   //     setError(null)
    //   //     window.location.reload()
    //   //   }}
    //   // />
    // )
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
        }
        .leaflet-tile {
          filter: brightness(0.9) contrast(1.1);
        }
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.7) !important;
          color: white !important;
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
      `}</style>
    </div>
  )
}
