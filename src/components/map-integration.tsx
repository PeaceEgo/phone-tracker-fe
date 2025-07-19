"use client"

import { useEffect, useState } from "react"
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

// Custom marker icons for different device types
const createCustomIcon = (color: string) => {
    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "custom-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    })
}

interface Coordinate {
    lat: number
    lng: number
    timestamp?: string
    deviceId?: string
    accuracy?: number
    address?: string
}

interface MapIntegrationProps {
    coordinates: Coordinate[]
    center?: [number, number]
    zoom?: number
    showPath?: boolean
    onCoordinateUpdate?: (coords: Coordinate[]) => void
}

export function MapIntegration({
    coordinates,
    center = [40.7589, -73.9851],
    zoom = 12,
    showPath = false,
    onCoordinateUpdate,
}: MapIntegrationProps) {
    const [processedCoordinates, setProcessedCoordinates] = useState<Coordinate[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Simulate reverse geocoding API call
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        setIsLoading(true)

        // Simulate API call to backend for reverse geocoding
        try {
            const response = await fetch("/api/reverse-geocode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lat, lng }),
            })

            if (response.ok) {
                const data = await response.json()
                return data.address
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error)
        }

        setIsLoading(false)
        // Fallback to coordinates if API fails
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }

    // Process new coordinates when they arrive
    useEffect(() => {
        const processCoordinates = async () => {
            if (coordinates.length === 0) return

            const processed = await Promise.all(
                coordinates.map(async (coord) => {
                    // Only process if we don't already have address data
                    if (!coord.address) {
                        const address = await reverseGeocode(coord.lat, coord.lng)
                        return {
                            ...coord,
                            address,
                            timestamp: coord.timestamp || new Date().toISOString(),
                        }
                    }
                    return coord
                }),
            )

            setProcessedCoordinates(processed)
            onCoordinateUpdate?.(processed)
        }

        processCoordinates()
    }, [coordinates, onCoordinateUpdate])

    return (
        <div className="relative">
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} className="rounded-lg">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {processedCoordinates.map((coord, index) => (
                    <Marker
                        key={`${coord.lat}-${coord.lng}-${index}`}
                        position={[coord.lat, coord.lng]}
                        icon={createCustomIcon("#ec4899")}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">Location {index + 1}</p>
                                <p className="text-gray-600">{coord.address || "Loading address..."}</p>
                                <p className="text-xs text-gray-500">
                                    {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                                </p>
                                {coord.accuracy && <p className="text-xs text-gray-500">Accuracy: ±{coord.accuracy}m</p>}
                                {coord.timestamp && (
                                    <p className="text-xs text-gray-500">{new Date(coord.timestamp).toLocaleString()}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {showPath && processedCoordinates.length > 1 && (
                    <Polyline
                        positions={processedCoordinates.map((coord) => [coord.lat, coord.lng])}
                        color="#ec4899"
                        weight={3}
                        opacity={0.7}
                    />
                )}
            </MapContainer>

            {isLoading && (
                <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm">
                    Processing coordinates...
                </div>
            )}
        </div>
    )
}
