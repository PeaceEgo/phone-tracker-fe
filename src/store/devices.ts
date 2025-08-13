import { create } from "zustand";
import { useAuthStore } from "./auth";


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
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,

  fetchDevices: async (forceRefresh = false) => {
    set({ error: null });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const cacheKey = `user_devices_cache_${userId}`;
    const etagKey = `user_devices_etag_${userId}`;

    // Load from cache instantly (first call)
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw && get().devices.length === 0) {
      try {
        const { devices, timestamp } = JSON.parse(cachedRaw);
        if (Array.isArray(devices)) {
          set({ devices, isLoading: false });
        }
        if (!forceRefresh && Date.now() - timestamp < CACHE_TTL) {
          return; // Cache is still fresh, skip fetch
        }
      } catch {
        /* Ignore broken cache */
      }
    }

    set({ isLoading: true });

    const etag = localStorage.getItem(etagKey) || "";

    try {
      const response = await fetch(
        "https://phone-tracker-be.onrender.com/api/devices/user-devices",
        {
          credentials: "include",
          headers: etag ? { "If-None-Match": etag } : {},
        }
      );

      if (response.status === 304) {
        set({ isLoading: false });
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch devices");

      const data = await response.json();
      const devices = data.devices || [];
      set({ devices, isLoading: false });

      // Save new cache + ETag
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ devices, timestamp: Date.now() })
      );
      if (response.headers.has("ETag")) {
        localStorage.setItem(etagKey, response.headers.get("ETag") as string);
      }
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
}));
