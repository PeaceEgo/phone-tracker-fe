"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowRight, Loader2, RotateCcw, ArrowLeft, CheckCircle } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading: boolean;
  error: string;
  successMessage?: string;
  onBack?: () => void;
}

export default function OTPVerification({ 
  email, 
  onVerify, 
  onResend, 
  isLoading, 
  error,
  onBack, 
  successMessage,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onVerify(otp);
  };

  const handleResend = async () => {
    await onResend();
  };

  // Show success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">Success!</h2>
              <p className="text-gray-300 mb-2">{successMessage}</p>
              <p className="text-gray-400 text-sm">
                You will be redirected to the login page shortly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-8">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-gray-400 hover:text-gray-300 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-12 h-12 text-blue-400" />
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-center text-xl tracking-widest font-mono"
                  required
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-gray-400 text-xs mt-2 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Resend Code
              </button>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-xs">
                The code will expire in 15 minutes
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}