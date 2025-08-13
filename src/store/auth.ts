import { create, StoreApi } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { loginUser, registerUser, logoutUser } from '@/lib/api'
import { useDevicesStore } from './devices'

interface User {
  id: string
  name: string
  email: string
}

interface RegisterParams {
  fullName: string
  email: string
  password: string
}

interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    fullName: string
  }
}

interface AuthState {
  accessToken: string | null
  refreshToken?: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (formData: RegisterParams) => Promise<void>
  setTokens: (accessToken: string, refreshToken?: string | null) => void
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: StoreApi<AuthState>['setState'], get: StoreApi<AuthState>['getState']): AuthState => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: (accessToken: string, refreshToken: string | null = null) =>
        set(() => ({
          accessToken,
          refreshToken,
          isAuthenticated: true
        })),

      setUser: (user: User | null) => set(() => ({ user })),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res: AuthResponse = await loginUser({ email, password })
          set({
            user: {
              id: res.user.id,
              name: res.user.fullName,
              email: res.user.email
            },
            accessToken: res.accessToken,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Login failed',
            isLoading: false
          })
          throw err
        }
      },

      register: async (formData: RegisterParams) => {
        set({ isLoading: true, error: null })
        try {
          const res: AuthResponse = await registerUser(formData)
          set({
            user: {
              id: res.user.id,
              name: res.user.fullName,
              email: res.user.email
            },
            accessToken: res.accessToken,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Registration failed',
            isLoading: false
          })
          throw err
        }
      },

      logout: async () => {
        try {
          await logoutUser()
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false
          })
        }
        set({ user: null, accessToken: null, refreshToken: null })

        useDevicesStore.getState().clearDevices()
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: localStorage as unknown as StateStorage,
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Interfaces for devices
export interface Device {
  deviceId: string
  name: string
  type: 'android' | 'ios'
  location: {
    type: string
    coordinates: [number, number]
  }
  locationName: string
  qrCodeId: string
  qrCodeImage?: string
  registrationMethod: 'direct' | 'qr'
  isActive: boolean
  registeredAt: string
}

export interface QRCodeData {
  qrCodeId: string
  qrCodeImage: string
  linkingUrl: string
  expiresAt: string
  deviceName: string
  deviceType: 'android' | 'ios'
}

export interface ApiResponse<T> {
  message: string
  device?: T
  devices?: T[]
  qrCode?: QRCodeData
}
