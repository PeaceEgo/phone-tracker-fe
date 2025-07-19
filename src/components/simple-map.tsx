"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons with your theme colors
const createCustomIcon = (color: string) => {
    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "custom-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    })
}

interface MapLocation {
    id: string | number
    lat: number
    lng: number
    title?: string
    description?: string
    deviceName?: string
    timestamp?: string
    [key: string]: any
}

interface SimpleMapProps {
    locations: MapLocation[]
    center?: [number, number]
    zoom?: number
    showPath?: boolean
    height?: string
    className?: string
}

export function SimpleMap({
    locations,
    center = [40.7589, -73.9851],
    zoom = 12,
    showPath = false,
    height = "400px",
    className = "",
}: SimpleMapProps) {
    return (
        <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} className="rounded-lg">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {locations.map((location) => (
                    <Marker key={location.id} position={[location.lat, location.lng]} icon={createCustomIcon("#ec4899")}>
                        <Popup>
                            <div className="text-sm">
                                {location.title && <p className="font-semibold">{location.title}</p>}
                                {location.description && <p className="text-gray-600">{location.description}</p>}
                                {location.deviceName && <p className="text-xs">Device: {location.deviceName}</p>}
                                {location.timestamp && <p className="text-xs text-gray-500">{location.timestamp}</p>}
                                <p className="text-xs text-gray-500">
                                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {showPath && locations.length > 1 && (
                    <Polyline positions={locations.map((loc) => [loc.lat, loc.lng])} color="#ec4899" weight={3} opacity={0.7} />
                )}
            </MapContainer>
        </div>
    )
}
