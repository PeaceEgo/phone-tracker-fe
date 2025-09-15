import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDevicesStore } from "@/store/devices";

interface LocationTrackingOptions {
  enableTracking?: boolean;
  updateInterval?: number; 
  highAccuracy?: boolean;
  maxAge?: number;
  timeout?: number;
}

export function useDeviceSocket(
  deviceIds: string[], 
  options: LocationTrackingOptions = {}
) {
  const updateDevice = useDevicesStore((s) => s.updateDevice);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const {
    enableTracking = true,
    updateInterval = 30000, 
    highAccuracy = true,
    maxAge = 60000, 
    timeout = 10000 
  } = options;

  
  const sendCurrentLocation = (socket: Socket, deviceId: string, force = false) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

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
          (navigator as any).getBattery().then((battery: any) => {
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

        console.log("Sending location update:", locationData);
        socket.emit("updateLocation", locationData);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        
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
              console.error("Network location also failed:", fallbackError.message);
            },
            { ...geoOptions, enableHighAccuracy: false }
          );
        }
      },
      geoOptions
    );
  };

  // Check location permission
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(permission.state);
          
          permission.addEventListener('change', () => {
            setLocationPermission(permission.state);
          });
        } catch (error) {
          console.warn("Could not check geolocation permission:", error);
        }
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    if (!deviceIds.length) return;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://phone-tracker-be.onrender.com";

    const socket = io(WS_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Connected to WS:", WS_URL);
      
      deviceIds.forEach((id) => {
        console.log("Watching device:", id);
        socket.emit("watchDevice", { deviceId: id });
        
        // Send initial location if tracking is enabled
        if (enableTracking && locationPermission === 'granted') {
          sendCurrentLocation(socket, id, true);
        }
      });
    });

    socket.on("locationUpdate", (payload) => {
      console.log("Location update received:", payload);
      updateDevice(payload.deviceId, {
        isOnline: true,
        location: payload.location,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });
    });

    socket.on("locationSaved", (payload) => {
      console.log("Location saved successfully:", payload);
    });

    socket.on("locationError", (payload) => {
      console.error("Location update error:", payload);
    });

    socket.on("trackingStarted", (payload) => {
      console.log("Tracking started:", payload);
      updateDevice(payload.deviceId, {
        isOnline: true,
        updatedAt: payload.timestamp || new Date().toISOString(),
      });
    });

    socket.on("trackingStopped", (payload) => {
      console.log("Tracking stopped:", payload);
      updateDevice(payload.deviceId, {
        isOnline: false,
        updatedAt: payload.timestamp || new Date().toISOString(),
      });
    });

    socket.on("deviceOffline", (payload) => {
      console.log("Device went offline:", payload);
      updateDevice(payload.deviceId, {
        isOnline: false,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsTracking(false);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      
      // Re-watch devices after reconnection
      deviceIds.forEach((id) => {
        socket.emit("watchDevice", { deviceId: id });
        
        // Send current location after reconnection
        if (enableTracking && locationPermission === 'granted') {
          setTimeout(() => sendCurrentLocation(socket, id, true), 1000);
        }
      });
    });

    socketRef.current = socket;

    // Set up periodic location updates if tracking is enabled
    if (enableTracking && locationPermission === 'granted') {
      setIsTracking(true);
      
      intervalRef.current = setInterval(() => {
        deviceIds.forEach((deviceId) => {
          sendCurrentLocation(socket, deviceId);
        });
      }, updateInterval);
    }

    return () => {
      console.log("Cleaning up socket connection");
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      socket.disconnect();
      socketRef.current = null;
      setIsTracking(false);
    };
  }, [deviceIds.join(","), updateDevice, enableTracking, locationPermission, updateInterval, highAccuracy, maxAge, timeout]);

  // Function to manually send location update
  const sendLocationUpdate = (deviceId: string, force = false) => {
    if (socketRef.current && socketRef.current.connected) {
      sendCurrentLocation(socketRef.current, deviceId, force);
    }
  };

  // Function to start/stop tracking
  const toggleTracking = () => {
    if (!socketRef.current) return;

    if (isTracking && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsTracking(false);
    } else if (locationPermission === 'granted') {
      intervalRef.current = setInterval(() => {
        deviceIds.forEach((deviceId) => {
          sendCurrentLocation(socketRef.current!, deviceId);
        });
      }, updateInterval);
      setIsTracking(true);
    }
  };

  return {
    socket: socketRef.current,
    isTracking,
    locationPermission,
    sendLocationUpdate,
    toggleTracking
  };
}