import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDevicesStore } from "@/store/devices";

interface LocationTrackingOptions {
  enableTracking?: boolean;
  updateInterval?: number; 
  highAccuracy?: boolean;
  maxAge?: number;
  timeout?: number;
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

// Extended Socket interface with our custom properties
interface CustomSocket extends Socket {
  isUpdatingLocation?: boolean;
}

// Global socket instance to prevent multiple connections
let globalSocket: CustomSocket | null = null;
let connectionCount = 0;

export function useDeviceSocket(
  deviceIds: string[], 
  options: LocationTrackingOptions = {}
) {
  const updateDevice = useDevicesStore((s) => s.updateDevice);
  const socketRef = useRef<CustomSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false); // Use separate ref for update tracking
  
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  const [isTracking, setIsTracking] = useState(false);
  
  const {
    enableTracking = true,
    updateInterval = 30000, 
    highAccuracy = true,
    maxAge = 60000, 
    timeout = 10000 
  } = options;

  // Stable sendCurrentLocation with debouncing
  const sendCurrentLocation = useCallback((socket: CustomSocket, deviceId: string, force = false) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    // Debounce: prevent multiple simultaneous location requests
    if (isUpdatingRef.current) {
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
      
        let batteryLevel: number | undefined;
        if ('getBattery' in navigator) {
          (navigator as NavigatorWithBattery).getBattery().then((battery: BatteryManager) => {
            batteryLevel = Math.round(battery.level * 100);
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

        console.log("📍 Sending location update:", locationData);
        socket.emit("updateLocation", locationData);
        
        // Reset flag after a short delay to allow consecutive updates but prevent floods
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 1000);
      },
      (error) => {
        console.error("❌ Geolocation error:", error.message);
        isUpdatingRef.current = false;
        
        // Try network-based location as fallback
        if (error.code === error.POSITION_UNAVAILABLE && highAccuracy) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
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
  }, [highAccuracy, maxAge, timeout]);

  // Check location permission separately to prevent effect re-runs
  useEffect(() => {
    if (!('permissions' in navigator)) {
      setLocationPermission('prompt');
      return;
    }

    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        // Use onchange instead of addEventListener to prevent memory leaks
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

  // Main socket effect - FIXED with proper dependencies
  useEffect(() => {
    if (!deviceIds.length) {
      console.log("⏭️ No device IDs provided, skipping socket setup");
      return;
    }

    console.log("🔄 Setting up socket for devices:", deviceIds);

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://phone-tracker-be.onrender.com";

    // Use global socket or create new one
    let socket: CustomSocket;
    if (globalSocket && globalSocket.connected) {
      console.log("🔗 Reusing existing global socket connection");
      socket = globalSocket;
    } else {
      console.log("🔌 Creating new socket connection");
      socket = io(WS_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3, // Reduced from 5
        reconnectionDelay: 2000,
        timeout: 15000,
      }) as CustomSocket;
      globalSocket = socket;
    }

    connectionCount++;
    console.log(`🔢 Active connections: ${connectionCount}`);

    const handleConnect = () => {
      console.log("✅ Socket connected, watching devices:", deviceIds);
      
      deviceIds.forEach((id) => {
        console.log("👀 Watching device:", id);
        socket.emit("watchDevice", { deviceId: id });
      });

      // Send initial location if tracking is enabled
      if (enableTracking && locationPermission === 'granted') {
        console.log("🚀 Sending initial location updates");
        deviceIds.forEach((id) => {
          // Stagger initial location updates
          setTimeout(() => {
            if (socket.connected) {
              sendCurrentLocation(socket, id, true);
            }
          }, Math.random() * 2000); // Random delay between 0-2 seconds
        });
      }
    };

    const handleLocationUpdate = (payload: any) => {
      console.log("📡 Location update received:", payload.deviceId);
      updateDevice(payload.deviceId, {
        isOnline: true,
        location: payload.location,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });
    };

    const handleLocationSaved = (payload: any) => {
      console.log("💾 Location saved:", payload.deviceId);
    };

    const handleDisconnect = (reason: string) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsTracking(false);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log("🔁 Socket reconnected, attempt:", attemptNumber);
      
      // Re-watch devices after reconnection with delay
      setTimeout(() => {
        if (socket.connected) {
          deviceIds.forEach((id) => {
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
    if (!socket.connected) {
      console.log("🔗 Connecting socket...");
      socket.connect();
    }

    // Set up periodic location updates
    if (enableTracking && locationPermission === 'granted') {
      console.log("🔄 Starting periodic location tracking");
      setIsTracking(true);
      
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (socket.connected) {
          deviceIds.forEach((deviceId) => {
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
  }, [deviceIds.join(','), enableTracking, locationPermission, updateInterval, sendCurrentLocation, updateDevice]);

  // Manual location update with debouncing
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
          deviceIds.forEach((deviceId) => {
            sendCurrentLocation(socket, deviceId);
          });
        }
      }, updateInterval);
      setIsTracking(true);
      console.log("🎯 Tracking started");
    }
  }, [isTracking, locationPermission, deviceIds, sendCurrentLocation, updateInterval]);

  // Check connection status
  const checkConnection = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  return {
    socket: socketRef.current,
    isTracking,
    locationPermission,
    sendLocationUpdate,
    toggleTracking,
    checkConnection
  };
}