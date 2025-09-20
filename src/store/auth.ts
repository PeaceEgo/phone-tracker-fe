import { create, StoreApi } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  verifyEmail as verifyEmailAPI,
  resendVerificationEmail,
  // type AuthResponse,
  type EmailVerificationResponse,
  getCurrentUser
} from '@/lib/api'
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

// Add interface for registration response
interface RegisterResponse {
  message: string
  user?: {
    id: string
    email: string
    fullName: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  needsVerification: boolean
  verificationEmail: string | null
  verificationSuccess: boolean
  verificationSentAt?: string

  login: (email: string, password: string) => Promise<void>
  register: (formData: RegisterParams) => Promise<RegisterResponse>
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  clearError: () => void
  initializeAuth: () => void
  verifyEmail: (otp: string) => Promise<EmailVerificationResponse>
  resendVerification: (email: string) => Promise<{ message: string }>
  setNeedsVerification: (needsVerification: boolean, email?: string) => void
  clearVerificationSuccess: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: StoreApi<AuthState>['setState'], get: StoreApi<AuthState>['getState']): AuthState => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      needsVerification: false,
      verificationEmail: null,
      verificationSuccess: false,

      setUser: (user: User | null) =>
        set(() => ({
          user,
          isAuthenticated: !!user
        })),

      setNeedsVerification: (needsVerification: boolean, email?: string) =>
        set({
          needsVerification,
          verificationEmail: email || null
        }),

initializeAuth: async () => {
  const state = get()
  if (state.isInitialized) return

  console.log('🚀 Initializing auth state from storage...')

  try {
    // Check if there is a valid session on app load
    const user = await getCurrentUser();
    if (user) {
      set({
        user: {
          id: user.id,
          name: user.fullName, 
          email: user.email
        },
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false
      });
      console.log('✅ Re-authenticated from existing session');
    } else {
      set({ isInitialized: true, isLoading: false });
    }
  } catch (error) {
    console.error('❌ Session initialization failed:', error);
    set({ isInitialized: true, isLoading: false });
  }
},
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await loginUser({ email, password })
          set({
            user: {
              id: res.user.id,
              name: res.user.fullName,
              email: res.user.email
            },
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            needsVerification: false,
            verificationSuccess: false 
          })
          console.log(res);

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Login failed'

          if (errorMessage.includes('verify your email') || errorMessage.includes('not verified')) {
            set({
              needsVerification: true,
              verificationEmail: email,
              error: errorMessage,
              isLoading: false
            })
          } else {
            set({
              error: errorMessage,
              isLoading: false
            })
          }
          throw err
        }
      },

      register: async (formData: RegisterParams) => {
        set({ isLoading: true, error: null, verificationSuccess: false })
        try {
          const res = await registerUser(formData)
          set({
            needsVerification: true,
            verificationEmail: formData.email,
            isLoading: false,
            isInitialized: true,
            verificationSuccess: false
          })
          return res
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Registration failed',
            isLoading: false
          })
          throw err
        }
      },

      verifyEmail: async (otp: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await verifyEmailAPI(otp)
          set({
            needsVerification: false,
            verificationEmail: null,
            isLoading: false,
            verificationSuccess: true
          })
          return result
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Verification failed',
            isLoading: false,
            verificationSuccess: false
          })
          throw err
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          const result = await resendVerificationEmail(email)
          set({ isLoading: false })
          return result
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to resend verification',
            isLoading: false
          })
          throw err
        }
      },

      logout: async () => {
        try {
          await logoutUser()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            needsVerification: false,
            verificationEmail: null,
            verificationSuccess: false
          })
        }
        useDevicesStore.getState().clearDevices()
      },

      clearError: () => set({ error: null }),

      clearVerificationSuccess: () => set({ verificationSuccess: false })
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        verificationEmail: state.verificationEmail
      })
    }
  )
)