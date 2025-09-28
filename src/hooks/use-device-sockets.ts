// hooks/useDeviceSocket.ts
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useDevicesStore } from "@/store/devices";

interface LocationTrackingOptions {
  enableTracking?: boolean;
  updateInterval?: number; 
  highAccuracy?: boolean;
  maxAge?: number;
  timeout?: number;
  minDistanceChange?: number; // Minimum distance in meters to trigger update
  minTimeInterval?: number; // Minimum time between updates
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery: () => Promise<BatteryManager>;
}

interface LocationUpdatePayload {
  deviceId: string;
  location: {
    latitude?: number;
    longitude?: number;
    type?: string;
    coordinates?: [number, number];
    accuracy?: number;
    speed?: number | null;
    heading?: number | null;
  };
  updatedAt?: string;
}

interface StoreLocationFormat {
  type: string;
  coordinates: [number, number];
}

interface LocationSavedPayload {
  deviceId: string;
  success: boolean;
  timestamp?: string;
}

interface CustomSocket extends Socket {
  isUpdatingLocation?: boolean;
}

interface LastLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

// Global socket instance management
let globalSocket: CustomSocket | null = null;
let connectionCount = 0;

// Location cache to avoid sending similar locations
const locationCache = new Map<string, LastLocation>();

// Calculate distance between two coordinates in meters using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function useDeviceSocket(
  deviceIds: string[], 
  options: LocationTrackingOptions = {}
) {
  const updateDevice = useDevicesStore((s) => s.updateDevice);
  const socketRef = useRef<CustomSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false);
  
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  const [isTracking, setIsTracking] = useState(false);
  
  const {
    enableTracking = true,
    updateInterval = 30000, // 30 seconds default
    highAccuracy = true,
    maxAge = 60000,
    timeout = 10000,
    minDistanceChange = 50, // 50 meters minimum change
    minTimeInterval = 30000 // 30 seconds minimum between updates
  } = options;

  // Memoize deviceIds to prevent unnecessary effect triggers
  const stableDeviceIds = useRef<string[]>([]);
  const deviceIdsString = useMemo(() => deviceIds.sort().join(','), [deviceIds]);
  
  useEffect(() => {
    stableDeviceIds.current = [...deviceIds];
  }, [deviceIdsString]);

  // Check if location is significantly different from last known location
  const shouldSendLocationUpdate = useCallback((deviceId: string, newLat: number, newLon: number, newAccuracy?: number): boolean => {
    const lastLocation = locationCache.get(deviceId);
    
    if (!lastLocation) {
      return true; // No previous location, always send
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastLocation.timestamp;
    
    // Always send if enough time has passed (even if location hasn't changed much)
    if (timeSinceLastUpdate >= minTimeInterval) {
      return true;
    }

    // Calculate distance from last location
    const distance = calculateDistance(
      lastLocation.latitude, 
      lastLocation.longitude, 
      newLat, 
      newLon
    );

    // Only send if moved significantly (beyond accuracy threshold + minimum change)
    const accuracyThreshold = Math.max(newAccuracy || 0, lastLocation.accuracy || 0);
    const effectiveMinDistance = minDistanceChange + accuracyThreshold;

    const shouldSend = distance >= effectiveMinDistance;

    if (!shouldSend) {
      console.log(`📍 Location unchanged (${distance.toFixed(1)}m < ${effectiveMinDistance}m), skipping update`);
    }

    return shouldSend;
  }, [minDistanceChange, minTimeInterval]);

  // Stable sendCurrentLocation with smart deduplication
  const sendCurrentLocation = useCallback((socket: CustomSocket, deviceId: string, force = false) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    // Prevent multiple simultaneous location requests
    if (isUpdatingRef.current && !force) {
      console.log("⏳ Location update already in progress, skipping...");
      return;
    }

    isUpdatingRef.current = true;

    const geoOptions = {
      enableHighAccuracy: highAccuracy,
      timeout: timeout,
      maximumAge: maxAge
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        
        // Check if we should send this location update
        if (!force && !shouldSendLocationUpdate(deviceId, latitude, longitude, accuracy)) {
          isUpdatingRef.current = false;
          return;
        }

        // Update location cache
        locationCache.set(deviceId, {
          latitude,
          longitude,
          accuracy,
          timestamp: Date.now()
        });
      
        // Get battery level if available
        let batteryLevel: number | undefined;
        if ('getBattery' in navigator) {
          (navigator as NavigatorWithBattery).getBattery().then((battery: BatteryManager) => {
            batteryLevel = Math.round(battery.level * 100);
          }).catch(() => {
            // Silent fail if battery API not available
          });
        }

        const locationData = {
          deviceId,
          latitude,
          longitude,
          force,
          accuracy: accuracy || undefined,
          speed: speed || undefined,
          heading: heading || undefined,
          batteryLevel,
          source: 'gps' as const
        };

        console.log("📍 Sending location update:", { 
          deviceId, 
          latitude: latitude.toFixed(6), 
          longitude: longitude.toFixed(6),
          accuracy: accuracy ? `${accuracy}m` : 'unknown'
        });
        
        socket.emit("updateLocation", locationData);
        
        // Reset flag after operation completes
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 1000);
      },
      (error) => {
        console.error("❌ Geolocation error:", error.message);
        isUpdatingRef.current = false;
        
        // Fallback to network location only if high accuracy failed
        if (error.code === error.POSITION_UNAVAILABLE && highAccuracy) {
          console.log("🔄 Trying network-based location as fallback...");
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              
              if (!force && !shouldSendLocationUpdate(deviceId, latitude, longitude, accuracy)) {
                isUpdatingRef.current = false;
                return;
              }

              locationCache.set(deviceId, {
                latitude,
                longitude,
                accuracy,
                timestamp: Date.now()
              });

              socket.emit("updateLocation", {
                deviceId,
                latitude,
                longitude,
                force,
                accuracy,
                source: 'network' as const
              });
            },
            (fallbackError) => {
              console.error("❌ Network location also failed:", fallbackError.message);
              isUpdatingRef.current = false;
            },
            { ...geoOptions, enableHighAccuracy: false }
          );
        }
      },
      geoOptions
    );
  }, [highAccuracy, maxAge, timeout, shouldSendLocationUpdate]);

  // Permission check - only run once
  useEffect(() => {
    if (!('permissions' in navigator)) {
      setLocationPermission('prompt');
      return;
    }

    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.onchange = () => {
          setLocationPermission(permission.state);
        };
      } catch (error) {
        console.warn("⚠️ Could not check geolocation permission:", error);
        setLocationPermission('prompt');
      }
    };

    checkPermission();
  }, []);

  // Main socket effect
  useEffect(() => {
    const currentDeviceIds = stableDeviceIds.current;
    if (!currentDeviceIds.length) {
      console.log("⏭️ No device IDs provided, skipping socket setup");
      return;
    }

    console.log("🔄 Setting up socket for devices:", currentDeviceIds);

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://phone-tracker-be.onrender.com";

    // Use global socket or create new one
    let socket: CustomSocket;
    if (globalSocket && (globalSocket.connected || globalSocket.active)) {
      console.log("🔗 Reusing existing global socket connection");
      socket = globalSocket;
    } else {
      console.log("🔌 Creating new socket connection");
      socket = io(WS_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 15000,
        autoConnect: false,
      }) as CustomSocket;
      globalSocket = socket;
    }

    connectionCount++;
    console.log(`🔢 Active connections: ${connectionCount}`);

    const handleConnect = () => {
      console.log("✅ Socket connected, watching devices:", currentDeviceIds);
      
      // Watch all devices
      currentDeviceIds.forEach((id) => {
        console.log("👀 Watching device:", id);
        socket.emit("watchDevice", { deviceId: id });
      });

      // Send initial location if tracking is enabled
      if (enableTracking && locationPermission === 'granted') {
        console.log("🚀 Sending initial location updates");
        currentDeviceIds.forEach((id, index) => {
          // Stagger initial location updates to prevent flooding
          setTimeout(() => {
            if (socket.connected) {
              sendCurrentLocation(socket, id, true); // Force initial update
            }
          }, index * 2000);
        });
      }
    };

    const handleLocationUpdate = (payload: LocationUpdatePayload) => {
      console.log("📡 Location update received:", payload.deviceId);
      
      // Convert location to GeoJSON format
      let location: StoreLocationFormat;
      
      if (payload.location.type && payload.location.coordinates) {
        location = {
          type: payload.location.type,
          coordinates: payload.location.coordinates
        };
      } else if (payload.location.latitude && payload.location.longitude) {
        location = {
          type: 'Point',
          coordinates: [payload.location.longitude, payload.location.latitude]
        };
      } else {
        console.error("Invalid location format received:", payload.location);
        return;
      }
      
      updateDevice(payload.deviceId, {
        isOnline: true,
        location: location,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });
    };

    const handleLocationSaved = (payload: LocationSavedPayload) => {
      console.log("💾 Location saved:", payload.deviceId);
    };

    const handleDisconnect = (reason: string) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsTracking(false);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log("🔁 Socket reconnected, attempt:", attemptNumber);
      
      // Re-watch devices after reconnection
      setTimeout(() => {
        if (socket.connected) {
          currentDeviceIds.forEach((id) => {
            socket.emit("watchDevice", { deviceId: id });
          });
        }
      }, 1000);
    };

    const handleConnectError = (error: Error) => {
      console.error("🔌 Socket connection error:", error);
    };

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("locationUpdate", handleLocationUpdate);
    socket.on("locationSaved", handleLocationSaved);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);
    socket.on("connect_error", handleConnectError);

    socketRef.current = socket;

    // Connect if not already connected
    if (!socket.connected && !socket.active) {
      console.log("🔗 Connecting socket...");
      socket.connect();
    }

    // Set up periodic location updates only if tracking is enabled
    if (enableTracking && locationPermission === 'granted') {
      console.log("🔄 Starting periodic location tracking");
      setIsTracking(true);
      
      // Clear existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Set new interval with proper cleanup
      intervalRef.current = setInterval(() => {
        if (socket.connected) {
          currentDeviceIds.forEach((deviceId) => {
            sendCurrentLocation(socket, deviceId);
          });
        }
      }, updateInterval);
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket effect");
      
      connectionCount--;
      console.log(`🔢 Remaining connections: ${connectionCount}`);
      
      // Remove event listeners
      socket.off("connect", handleConnect);
      socket.off("locationUpdate", handleLocationUpdate);
      socket.off("locationSaved", handleLocationSaved);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
      socket.off("connect_error", handleConnectError);
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reset update flag
      isUpdatingRef.current = false;
      
      // Only disconnect if no components are using the socket
      if (connectionCount === 0 && globalSocket) {
        console.log("🔌 Disconnecting global socket (no active connections)");
        globalSocket.disconnect();
        globalSocket = null;
      }
      
      setIsTracking(false);
    };
  }, [enableTracking, locationPermission, updateInterval, sendCurrentLocation, updateDevice]);

  // Manual location update with deduplication
  const sendLocationUpdate = useCallback((deviceId: string, force = false) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      sendCurrentLocation(socket, deviceId, force);
    } else {
      console.warn("⚠️ Socket not connected, cannot send location update");
    }
  }, [sendCurrentLocation]);

  // Toggle tracking
  const toggleTracking = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    if (isTracking) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
      console.log("⏹️ Tracking stopped");
    } else if (locationPermission === 'granted') {
      intervalRef.current = setInterval(() => {
        if (socket.connected) {
          stableDeviceIds.current.forEach((deviceId) => {
            sendCurrentLocation(socket, deviceId);
          });
        }
      }, updateInterval);
      setIsTracking(true);
      console.log("🎯 Tracking started");
    }
  }, [isTracking, locationPermission, sendCurrentLocation, updateInterval]);

  // Check connection status
  const checkConnection = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  // Clear location cache for a specific device
  const clearLocationCache = useCallback((deviceId: string) => {
    locationCache.delete(deviceId);
    console.log("🗑️ Cleared location cache for device:", deviceId);
  }, []);

  return {
    socket: socketRef.current,
    isTracking,
    locationPermission,
    sendLocationUpdate,
    toggleTracking,
    checkConnection,
    clearLocationCache
  };
}