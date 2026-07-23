"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      void initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Only gate on session probe, not on login/register loading flags
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}