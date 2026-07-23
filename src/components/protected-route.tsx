"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
