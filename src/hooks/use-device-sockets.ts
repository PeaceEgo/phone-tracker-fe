"use client";

import { useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useDevicesStore } from "@/store/devices";
import { getSocketAuthToken } from "@/lib/socket-auth";

interface LocationUpdatePayload {
  deviceId: string;
  location: {
    latitude?: number;
    longitude?: number;
    type?: string;
    coordinates?: [number, number];
  };
  updatedAt?: string;
}

/** Shared Socket.IO client for dashboard live updates (listen-only). */
let globalSocket: Socket | null = null;
let connectionCount = 0;

function parseLocation(payload: LocationUpdatePayload) {
  const loc = payload.location;
  if (loc.type && loc.coordinates) {
    return { type: loc.type, coordinates: loc.coordinates };
  }
  if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
    return {
      type: "Point",
      coordinates: [loc.longitude, loc.latitude] as [number, number],
    };
  }
  return null;
}

/**
 * Subscribe to live location updates for the given device IDs.
 * Does not emit browser GPS — phones report via the companion claim/link flow.
 */
export function useDeviceSocket(deviceIds: string[]) {
  const updateDevice = useDevicesStore((s) => s.updateDevice);
  const socketRef = useRef<Socket | null>(null);

  const deviceIdsKey = useMemo(
    () => [...deviceIds].filter(Boolean).sort().join(","),
    [deviceIds]
  );

  useEffect(() => {
    const ids = deviceIdsKey ? deviceIdsKey.split(",") : [];
    if (ids.length === 0) return;

    const WS_URL =
      process.env.NEXT_PUBLIC_WS_URL || "wss://phone-tracker-be.onrender.com";
    let cancelled = false;
    let socket: Socket | null = null;

    const watchAll = () => {
      ids.forEach((deviceId) => {
        socket?.emit("watchDevice", { deviceId });
      });
    };

    const onLocationUpdate = (payload: LocationUpdatePayload) => {
      const location = parseLocation(payload);
      if (!location) return;
      updateDevice(payload.deviceId, {
        isOnline: true,
        location,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });
    };

    const onReconnect = () => {
      setTimeout(() => {
        if (socket?.connected) watchAll();
      }, 500);
    };

    const setup = async () => {
      if (globalSocket && (globalSocket.connected || globalSocket.active)) {
        socket = globalSocket;
      } else {
        const token = await getSocketAuthToken();
        if (cancelled) return;

        socket = io(WS_URL, {
          withCredentials: true,
          auth: token ? { token } : undefined,
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 15000,
          autoConnect: false,
        });
        globalSocket = socket;
      }

      if (cancelled || !socket) return;

      connectionCount += 1;
      socketRef.current = socket;

      socket.on("connect", watchAll);
      socket.on("locationUpdate", onLocationUpdate);
      socket.on("reconnect", onReconnect);
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      if (!socket.connected && !socket.active) {
        socket.connect();
      } else if (socket.connected) {
        watchAll();
      }
    };

    void setup();

    return () => {
      cancelled = true;
      connectionCount = Math.max(0, connectionCount - 1);

      if (socket) {
        socket.off("connect", watchAll);
        socket.off("locationUpdate", onLocationUpdate);
        socket.off("reconnect", onReconnect);
      }

      if (connectionCount === 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, [deviceIdsKey, updateDevice]);

  return { socket: socketRef.current };
}
