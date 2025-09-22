"use client"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Smartphone, CheckCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"

const VerifyEmailContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  const {
    verifyEmail,
    resendVerification,
    isLoading,
    error,
    verificationSuccess,
    clearError,
    clearVerificationSuccess,
    verificationEmail
  } = useAuthStore()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    } else {
      // If no email param, check if we have verification email in store
      if (verificationEmail) {
        setEmail(verificationEmail)
      } else {
        router.push("/auth/login")
      }
    }

    // Clear any previous states when component mounts
    clearError()
    clearVerificationSuccess()
  }, [searchParams, router, clearError, clearVerificationSuccess, verificationEmail])

  // Handle successful verification
  useEffect(() => {
    if (verificationSuccess) {
      // Clear the needs verification state since we're done
      setTimeout(() => {
        clearVerificationSuccess()
        router.push("/auth/login?message=Email verified successfully. Please login.")
      }, 2000)
    }
  }, [verificationSuccess, clearVerificationSuccess, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return

    try {
      await verifyEmail(otp)
      // Success is handled by the useEffect above
    } catch (err) {
      // Error is already handled by the store
      console.error("Verification failed:", err)
    }
  }

  const handleResend = async () => {
    if (!email) return

    try {
      await resendVerification(email)
      // Success message is handled by the store if needed
    } catch (err) {
      console.error("Resend failed:", err)
    }
  }

  // Show success screen using Zustand store state
  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">Email Verified!</h2>
            <p className="text-gray-300 mb-2">Email verified successfully! Redirecting to login...</p>
            <p className="text-gray-400 text-sm">
              You will be redirected to the login page shortly.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Logo and title */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div className="flex items-center justify-center space-x-2" whileHover={{ scale: 1.05 }}>
          <Smartphone className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            TrackGuard
          </span>
        </motion.div>
      </motion.div>

      {/* OTP Verification Component */}
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-8">
            {/* Back button */}
            <button
              onClick={() => router.push("/auth/register")}
              className="flex items-center text-gray-400 hover:text-gray-300 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Verify Your Email
              </h2>
              <p className="text-gray-400 mb-2">
                We sent a 6-digit code to
              </p>
              <p className="text-blue-400 font-medium">{email}</p>
              <p className="text-gray-400 text-sm mt-2">
                Check your inbox and enter the code below
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-center mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-center text-xl tracking-widest font-mono"
                  required
                  disabled={isLoading}
                />
                <p className="text-gray-400 text-xs mt-2 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm mb-3">
                Didn &apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend Code
              </button>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-xs">
                The code will expire in 15 minutes
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}

export default VerifyEmailPage