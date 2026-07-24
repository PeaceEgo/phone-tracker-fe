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

  // Don't block public routes (e.g. /link-device claim) on /auth/me
  return <>{children}</>;
}
