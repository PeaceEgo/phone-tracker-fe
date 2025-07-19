"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import map components to avoid SSR issues
export const DynamicMapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-96 rounded-lg" />,
})

export const DynamicTileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })

export const DynamicMarker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

export const DynamicPopup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

export const DynamicPolyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })
