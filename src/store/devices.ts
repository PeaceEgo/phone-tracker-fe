import { create } from "zustand";
import { useAuthStore } from "./auth";
import { fetchWithAutoRefresh } from "@/lib/api";

export interface Device {
  deviceId: string;
  name: string;
  type: "ios" | "android";
  createdAt: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  qrCodeId: string;
  qrCodeImage?: string;
  registrationMethod: "direct" | "qr";
  isActive: boolean;
  registeredAt?: string;
  isOnline: boolean;
  updatedAt?: string;
}

interface DevicesState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  fetchDevices: (forceRefresh?: boolean) => Promise<void>;
  addDevice: (device: Device) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  removeDevice: (deviceId: string) => Promise<void>;
  getDeviceById: (deviceId: string) => Device | undefined;
  clearDevices: () => void;
  fetchLocationHistory: (deviceId: string) => Promise<any>;
  updateOnlineStatusFromHistory: (deviceId: string, latestTimestamp: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; 

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,

  // In your devices store
fetchDevices: async (forceRefresh = false) => {
  set({ error: null });

  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  set({ isLoading: true });

  try {
    const response = await fetchWithAutoRefresh(
      `${process.env.NEXT_PUBLIC_API_URL}/devices/user-devices`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch devices");

    const data = await response.json();
    const devices = data.devices || [];
    set({ devices, isLoading: false });

    // Cache logic here...
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : "Failed to fetch devices",
      isLoading: false,
    });
  }
},

  addDevice: (device) => {
    const updated = [...get().devices, device];
    set({ devices: updated });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    localStorage.setItem(
      `user_devices_cache_${userId}`,
      JSON.stringify({ devices: updated, timestamp: Date.now() })
    );
  },

  updateDevice: (deviceId, updates) => {
    const updated = get().devices.map((d) =>
      d.deviceId === deviceId ? { ...d, ...updates } : d
    );
    set({ devices: updated });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    localStorage.setItem(
      `user_devices_cache_${userId}`,
      JSON.stringify({ devices: updated, timestamp: Date.now() })
    );
  },

  removeDevice: async (deviceId) => {
    const prevDevices = get().devices;
    const updated = prevDevices.filter((d) => d.deviceId !== deviceId);
    set({ devices: updated });

    const userId = useAuthStore.getState().user?.id;
    const cacheKey = `user_devices_cache_${userId}`;
    if (userId) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ devices: updated, timestamp: Date.now() })
      );
    }

    try {
      const response = await fetch(
        `https://phone-tracker-be.onrender.com/api/devices/${deviceId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to delete device");
    } catch (error) {
      set({ devices: prevDevices });
      if (userId) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ devices: prevDevices, timestamp: Date.now() })
        );
      }
      throw error;
    }
  },

  clearDevices: () => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      localStorage.removeItem(`user_devices_cache_${userId}`);
      localStorage.removeItem(`user_devices_etag_${userId}`);
    }
    set({ devices: [] });
  },

  getDeviceById: (deviceId) =>
    get().devices.find((device) => device.deviceId === deviceId),

  fetchLocationHistory: async (deviceId: string) => {
    try {
      const res = await fetch(
        `https://phone-tracker-be.onrender.com/locations/history/${deviceId}`,
        { credentials: "include" }
      );
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Not authorized to view this device's location history");
        }
        if (res.status === 404) {
          throw new Error("Device not found");
        }
        throw new Error(`Failed to fetch history: ${res.status}`);
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching location history:", err);
      throw err; 
    }
  },

  updateOnlineStatusFromHistory: (deviceId: string, latestTimestamp: string) => {
    const now = new Date();
    const lastUpdate = new Date(latestTimestamp);
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    get().updateDevice(deviceId, { isOnline: minutesSinceUpdate < 15 });
  },

  fetchDistanceCovered: async (deviceId: string, hours?: number) => {
  const res = await fetch(
    `https://phone-tracker-be.onrender.com/api/locations/distance/${deviceId}?hours=${hours || 24}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch distance");
  return await res.json();
},

// Add these methods to your store if needed:

// Get location trail (movement path)
fetchLocationTrail: async (deviceId: string, hours?: number) => {
  const res = await fetch(
    `https://phone-tracker-be.onrender.com/api/locations/trail/${deviceId}?hours=${hours || 24}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch trail");
  return await res.json();
},

// Get location stats
fetchLocationStats: async (deviceId: string, days?: number) => {
  const res = await fetch(
    `https://phone-tracker-be.onrender.com/api/locations/stats/${deviceId}?days=${days || 7}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch stats");
  return await res.json();
}
}));