"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Zap, AlertCircle, RefreshCw } from "lucide-react"
import { TrackingMap } from "./map-integration"
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client"

// Updated interfaces with proper type definitions
export interface LocationUpdate {
  deviceId: string;
  location: { 
    latitude?: number; 
    longitude?: number; 
    coordinates: [number, number];
    type: 'Point';
  };
  locationName: string;
  updatedAt: string;
  trail?: Array<{ lat: number; lng: number; timestamp: string }>;
}

interface BackendDevice {
  deviceId: string;
  name: string;
  location?: { coordinates: [number, number] };
  locationName?: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface Device {
  id: number;
  name: string;
  status: string;
  location: string;
  coordinates: { lat: number; lng: number; display: string };
  lastUpdate: string;
  deviceId: string;
  locationName: string;
  trail?: Array<{ lat: number; lng: number; timestamp: string }>;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastAttempt: Date | null;
  retryCount: number;
}

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

export function RealTimeTracking() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastAttempt: null,
    retryCount: 0
  })
  
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionAttemptRef = useRef<boolean>(false)
  const hasInitializedRef = useRef<boolean>(false)

  // Configuration
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://phone-tracker-be-mqpm.vercel.app"
  
  // Connection settings
  const MAX_RETRIES = 5
  const RETRY_DELAY = 5000 // 5 seconds
  const CONNECTION_TIMEOUT = 10000 // 10 seconds
  const HEARTBEAT_INTERVAL = 30000 // 30 seconds

  // Helper functions
  const formatCoordinates = useCallback((lat: number, lng: number): string => {
    return `${lat.toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`
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

  const isDeviceOnline = useCallback((updatedAt?: string): boolean => {
    if (!updatedAt) return false
    return new Date().getTime() - new Date(updatedAt).getTime() < 60000 
  }, [])

  const transformBackendDevice = useCallback((backendDevice: BackendDevice, index: number): Device => {
    const lat = backendDevice.location?.coordinates?.[1] || 0
    const lng = backendDevice.location?.coordinates?.[0] || 0
    
    return {
      id: index + 1,
      deviceId: backendDevice.deviceId, 
      name: backendDevice.name,
      status: isDeviceOnline(backendDevice.updatedAt) ? "online" : "offline",
      location: backendDevice.locationName || "Unknown",
      locationName: backendDevice.locationName || "Unknown", 
      coordinates: {
        lat,
        lng,
        display: formatCoordinates(lat, lng),
      },
      lastUpdate: backendDevice.updatedAt ? formatLastUpdate(backendDevice.updatedAt) : "Never",
      trail: [] // Initialize empty trail
    }
  }, [formatCoordinates, formatLastUpdate, isDeviceOnline])

  // Cleanup socket connection
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      console.log("Cleaning up socket connection")
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    connectionAttemptRef.current = false
  }, [])

  // Update device location from WebSocket - THIS IS THE KEY FUNCTION
  const updateDeviceLocation = useCallback((payload: LocationUpdate) => {
    console.log("📍 Updating device location:", payload)
    
    setDevices((prevDevices) => {
      const updatedDevices = prevDevices.map((device) => {
        if (device.deviceId === payload.deviceId) {
          // Extract coordinates from the payload
          let lat: number, lng: number;
          
          if (payload.location.latitude !== undefined && payload.location.longitude !== undefined) {
            lat = payload.location.latitude;
            lng = payload.location.longitude;
          } else {
            // Use coordinates array format [lng, lat]
            lng = payload.location.coordinates[0];
            lat = payload.location.coordinates[1];
          }

          // Add current position to trail
          const newTrailPoint = {
            lat,
            lng,
            timestamp: payload.updatedAt
          };

          const updatedTrail = [
            ...(device.trail || []),
            newTrailPoint
          ].slice(-50); // Keep last 50 points

          const updatedDevice = {
            ...device,
            status: "online" as const,
            location: payload.locationName || device.location,
            locationName: payload.locationName || device.locationName,
            coordinates: {
              lat,
              lng,
              display: formatCoordinates(lat, lng),
            },
            lastUpdate: formatLastUpdate(payload.updatedAt),
            trail: updatedTrail
          };

          console.log(`✅ Updated device ${device.deviceId}:`, updatedDevice.coordinates);
          return updatedDevice;
        }
        return device;
      });

      console.log("📊 All devices after update:", updatedDevices.map(d => ({ 
        id: d.deviceId, 
        coords: d.coordinates, 
        status: d.status 
      })));
      
      return updatedDevices;
    });
  }, [formatCoordinates, formatLastUpdate]);

  // Initialize WebSocket with better error handling and reconnection
  const initializeSocket = useCallback(async (deviceIds: string[] = []) => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptRef.current) {
      console.log("Connection attempt already in progress")
      return
    }

    if (deviceIds.length === 0) {
      console.log("No devices to track, skipping socket connection")
      return
    }

    try {
      connectionAttemptRef.current = true
      
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
        lastAttempt: new Date()
      }))

      // Clean up any existing connection
      cleanupSocket()

      console.log(`🚀 Attempting to connect to WebSocket: ${WS_URL}`)
      console.log(`📱 Device IDs to watch: ${deviceIds.join(', ')}`)

      // Create socket with optimized configuration
      const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WS_URL, {
        timeout: CONNECTION_TIMEOUT,
        reconnection: true,
        reconnectionAttempts: MAX_RETRIES,
        reconnectionDelay: RETRY_DELAY,
        reconnectionDelayMax: RETRY_DELAY * 2,
        randomizationFactor: 0.5,
        forceNew: true,
        autoConnect: true,
        withCredentials: true,
        upgrade: true,
        rememberUpgrade: false,
        transports: ['websocket', 'polling'], 
      })

      socketRef.current = socket

      // Connection successful
      socket.on("connect", () => {
        console.log("✅ WebSocket connected successfully, ID:", socket.id)
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
          lastAttempt: new Date(),
          retryCount: 0
        })
        
        // Join rooms for all devices
        deviceIds.forEach((deviceId) => {
          console.log(`📱 Watching device: ${deviceId}`)
          socket.emit("watchDevice", { deviceId })
        })

        // Setup heartbeat
        const heartbeat = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping')
          }
        }, HEARTBEAT_INTERVAL)

        socket.on('disconnect', () => {
          clearInterval(heartbeat)
        })
      })

      // Connection error handling
      socket.on("connect_error", (err: Error) => {
        console.error("❌ WebSocket connection error:", err.message)
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: `Connection failed: ${err.message}`,
          retryCount: prev.retryCount + 1
        }))
        
        connectionAttemptRef.current = false
      })

      // Disconnection handling
      socket.on("disconnect", (reason: string) => {
        console.log(`🔌 WebSocket disconnected: ${reason}`)
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: reason === 'io server disconnect' ? 'Server disconnected' : null
        }))
        
        connectionAttemptRef.current = false
      })

      // Reconnection attempts
      socket.on("reconnect_attempt", (attemptNumber: number) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`)
        setConnectionState(prev => ({
          ...prev,
          isConnecting: true,
          retryCount: attemptNumber
        }))
      })

      socket.on("reconnect_failed", () => {
        console.error("💥 Failed to reconnect after maximum attempts")
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Failed to reconnect after maximum attempts'
        }))
        connectionAttemptRef.current = false
      })

      // CRITICAL: Location update handler - This receives real-time updates
      socket.on("locationUpdate", (payload: LocationUpdate) => {
        console.log("📍 Location update received from server:", payload)
        updateDeviceLocation(payload)
      })

      // Device notification handler - May also contain location data
      socket.on("deviceNotification", (payload: LocationUpdate) => {
        console.log("🔔 Device notification received:", payload)
        // Device notifications can also contain location updates
        if (payload.location) {
          updateDeviceLocation(payload)
        }
      })

      // Tracking started handler
      socket.on("trackingStarted", (data: { deviceId: string; message: string; timestamp: string }) => {
        console.log("▶️ Tracking started for device:", data.deviceId)
        setDevices(prev => prev.map(device => 
          device.deviceId === data.deviceId 
            ? { ...device, status: 'online', lastUpdate: formatLastUpdate(data.timestamp) }
            : device
        ))
      })

      // Pong response
      socket.on('pong', () => {
        // Heartbeat response received - connection is alive
        console.log("💗 Heartbeat pong received")
      })

      connectionAttemptRef.current = false

    } catch (err) {
      console.error("💥 Error initializing socket:", err)
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Failed to initialize connection'
      }))
      connectionAttemptRef.current = false
    }
  }, [WS_URL, CONNECTION_TIMEOUT, MAX_RETRIES, RETRY_DELAY, HEARTBEAT_INTERVAL, cleanupSocket, updateDeviceLocation, formatLastUpdate])

  // Manual reconnection function
  const handleManualReconnect = useCallback(() => {
    console.log("🔄 Manual reconnection requested")
    const deviceIds = devices.map(d => d.deviceId)
    initializeSocket(deviceIds)
  }, [devices, initializeSocket])

  // Fetch devices from API
  useEffect(() => {
    if (hasInitializedRef.current) return;

    const fetchDevices = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log("🔄 Fetching devices from API...")
        const response = await fetch(`${API_URL}/devices/user-devices`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.statusText}`)
        }
        
        const data = await response.json() as { devices: BackendDevice[] }
        
        const transformedDevices = data.devices.map((device, index) => 
          transformBackendDevice(device, index)
        )
        
        console.log(`✅ Loaded ${transformedDevices.length} devices:`, transformedDevices.map(d => ({
          id: d.deviceId,
          name: d.name,
          coords: d.coordinates
        })))
        
        setDevices(transformedDevices)
        hasInitializedRef.current = true;
      } catch (err: unknown) {
        console.error("❌ Error fetching devices:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load devices"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
  }, [API_URL, transformBackendDevice])

  // Initialize WebSocket when devices are loaded
  useEffect(() => {
    if (devices.length > 0 && !connectionState.isConnected && !connectionState.isConnecting && hasInitializedRef.current) {
      const deviceIds = devices.map(d => d.deviceId)
      console.log(`🚀 Initializing WebSocket for ${deviceIds.length} devices:`, deviceIds)
      
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        initializeSocket(deviceIds)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [devices, connectionState.isConnected, connectionState.isConnecting, initializeSocket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting, cleaning up...")
      cleanupSocket()
    }
  }, [cleanupSocket])

  // Handle device click to start tracking
  const handleDeviceClick = async (device: Device): Promise<void> => {
    try {
      console.log(`🎯 Starting tracking for device: ${device.deviceId}`)
      const response = await fetch(`${API_URL}/devices/${device.deviceId}/start-tracking`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to start tracking: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log(`✅ Started tracking for device ${device.deviceId}:`, result)
      
      // Update device status immediately
      setDevices(prev => prev.map(d => 
        d.deviceId === device.deviceId 
          ? { ...d, status: 'online', lastUpdate: 'Just now' }
          : d
      ))
      
    } catch (err: unknown) {
      console.error("❌ Error starting tracking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to start tracking"
      setError(errorMessage)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No devices state
  if (devices.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Devices Found</h2>
          <p className="text-gray-400">Register some devices to start tracking</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-8 p-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
            Real-time Tracking
          </h1>
          <p className="text-gray-400 text-lg">Monitor {devices.length} device{devices.length !== 1 ? 's' : ''} with live updates</p>
        </motion.div>

        {/* Connection Status Alert */}
        {connectionState.error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Connection Issue</p>
                      <p className="text-red-300 text-sm">{connectionState.error}</p>
                      {connectionState.retryCount > 0 && (
                        <p className="text-red-300 text-xs">Attempt {connectionState.retryCount}/{MAX_RETRIES}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleManualReconnect}
                    disabled={connectionState.isConnecting}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${connectionState.isConnecting ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Device Status Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm text-gray-400">Online</p>
                    <p className="text-2xl font-bold text-green-400">
                      {devices.filter(d => d.status === "online").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-400">Offline</p>
                    <p className="text-2xl font-bold text-gray-400">
                      {devices.filter(d => d.status === "offline").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Devices</p>
                    <p className="text-2xl font-bold text-blue-400">{devices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Live Map - Pass properly typed socket */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-400" />
                </div>
                Live Tracking Map
                <div className="ml-auto flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionState.isConnected ? "bg-green-500 animate-pulse" : 
                      connectionState.isConnecting ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm text-white">
                    {connectionState.isConnected ? "Live" : 
                     connectionState.isConnecting ? "Connecting..." : "Offline"}
                  </span>
                  {connectionState.isConnected && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingMap 
                devices={devices} 
                height="h-[600px]" 
                showTrails={true}
                socket={socketRef.current}
                watchedDeviceIds={devices.map(d => d.deviceId)}
                onDeviceClick={handleDeviceClick} 
              />
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-400">
                      Last update: {devices.find(d => d.status === "online")?.lastUpdate || "N/A"}
                    </p>
                  </div>
                  {connectionState.lastAttempt && (
                    <p className="text-xs text-gray-500">
                      Last connection attempt: {connectionState.lastAttempt.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}