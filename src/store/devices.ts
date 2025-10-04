// store/devices.ts
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

interface LocationHistoryResponse {
  history: Array<{
    _id: string;
    location: { 
      type: string;
      coordinates: [number, number];
    };
    locationName: string;
    timestamp: string;
    accuracy?: string;
    battery?: number;
    activity?: string;
    speed?: number;
    heading?: number;
    address?: string;
  }>;
  total: number;
  deviceId?: string;
  deviceName?: string;
  timePeriod?: string;
}

interface DistanceCoveredResponse {
  distance: number;
  unit: string;
  timePeriod: string;
  deviceId?: string;
  deviceName?: string;
}

interface LocationTrailResponse {
  trail: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }>;
  totalPoints: number;
  deviceId?: string;
  deviceName?: string;
  timePeriod?: string;
}

interface LocationStatsResponse {
  totalLocations: number;
  averageDailyLocations: number;
  mostActiveDay: string;
  distanceCovered: number;
  timePeriod: string;
  deviceId?: string;
  deviceName?: string;
  maxSpeed?: number;
  avgSpeed?: number;
  totalDistance?: number;
}

interface DevicesState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  fetchPromise: Promise<void> | null; 
  fetchDevices: (forceRefresh?: boolean) => Promise<void>;
  addDevice: (device: Device) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  removeDevice: (deviceId: string) => Promise<void>;
  getDeviceById: (deviceId: string) => Device | undefined;
  clearDevices: () => void;
  fetchLocationHistory: (deviceId: string) => Promise<LocationHistoryResponse>;
  updateOnlineStatusFromHistory: (deviceId: string, latestTimestamp: string) => void;
  fetchDistanceCovered: (deviceId: string, hours?: number) => Promise<DistanceCoveredResponse>;
  fetchLocationTrail: (deviceId: string, hours?: number) => Promise<LocationTrailResponse>;
  fetchLocationStats: (deviceId: string, days?: number) => Promise<LocationStatsResponse>;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache
const MIN_FETCH_INTERVAL = 30000; // 30 seconds minimum between API calls

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,
  fetchPromise: null,

  fetchDevices: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    
    // Check if we have a fetch in progress
    if (state.fetchPromise && !forceRefresh) {
      console.log('📱 Device fetch already in progress, waiting...');
      return state.fetchPromise;
    }
    
    // Check minimum interval between fetches (prevent rapid successive calls)
    if (!forceRefresh && (now - state.lastFetchTime) < MIN_FETCH_INTERVAL) {
      console.log('📱 Too soon to fetch devices again, skipping...');
      return Promise.resolve();
    }

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      console.log('📱 No user ID, skipping device fetch');
      return Promise.resolve();
    }

    // Check cache first (unless force refresh) - 10 minute TTL
    if (!forceRefresh) {
      const cacheKey = `user_devices_cache_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { devices, timestamp } = JSON.parse(cached);
          if (now - timestamp < CACHE_TTL) {
            console.log('📱 Using cached devices (10min cache)');
            set({ devices, lastFetchTime: now });
            return Promise.resolve();
          } else {
            console.log('📱 Cache expired, fetching fresh data');
          }
        } catch (e) {
          console.warn('Failed to parse device cache:', e);
          localStorage.removeItem(cacheKey);
        }
      }
    }

    console.log('📱 Fetching devices from server...');
    set({ error: null, isLoading: true });

    const fetchPromise = (async () => {
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

        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.status}`);
        }

        const data = await response.json();
        const devices = data.devices || [];
        
        console.log('📱 Devices fetched successfully:', devices.length);
        
        set({ 
          devices, 
          isLoading: false, 
          lastFetchTime: now,
          fetchPromise: null
        });

        // Update cache with 10-minute TTL
        const cacheKey = `user_devices_cache_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          devices,
          timestamp: now
        }));

      } catch (error) {
        console.error('📱 Device fetch error:', error);
        set({
          error: error instanceof Error ? error.message : "Failed to fetch devices",
          isLoading: false,
          fetchPromise: null
        });
        throw error;
      }
    })();

    set({ fetchPromise });
    return fetchPromise;
  },

  addDevice: (device) => {
    const state = get();
    const updated = [...state.devices, device];
    set({ devices: updated });

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    localStorage.setItem(
      `user_devices_cache_${userId}`,
      JSON.stringify({ devices: updated, timestamp: Date.now() })
    );
  },

  updateDevice: (deviceId, updates) => {
    const state = get();
    const updated = state.devices.map((d) =>
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
    const state = get();
    const prevDevices = state.devices;
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
      const response = await fetchWithAutoRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/${deviceId}`,
        { 
          method: "DELETE", 
          credentials: "include" 
        }
      );
      
      if (!response.ok) throw new Error("Failed to delete device");
    } catch (error) {
      // Rollback on error
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
    set({ 
      devices: [], 
      lastFetchTime: 0,
      fetchPromise: null 
    });
  },

  getDeviceById: (deviceId) =>
    get().devices.find((device) => device.deviceId === deviceId),

  fetchLocationHistory: async (deviceId: string): Promise<LocationHistoryResponse> => {
    try {
      const res = await fetchWithAutoRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/locations/history/${deviceId}`,
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

  fetchDistanceCovered: async (deviceId: string, hours?: number): Promise<DistanceCoveredResponse> => {
    const res = await fetchWithAutoRefresh(
      `${process.env.NEXT_PUBLIC_API_URL}/locations/distance/${deviceId}?hours=${hours || 24}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch distance");
    return await res.json();
  },

  fetchLocationTrail: async (deviceId: string, hours?: number): Promise<LocationTrailResponse> => {
    const res = await fetchWithAutoRefresh(
      `${process.env.NEXT_PUBLIC_API_URL}/locations/trail/${deviceId}?hours=${hours || 24}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch trail");
    return await res.json();
  },

  fetchLocationStats: async (deviceId: string, days?: number): Promise<LocationStatsResponse> => {
    const res = await fetchWithAutoRefresh(
      `${process.env.NEXT_PUBLIC_API_URL}/locations/stats/${deviceId}?days=${days || 7}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  }
}));