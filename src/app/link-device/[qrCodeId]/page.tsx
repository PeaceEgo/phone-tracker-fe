"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Loader2, MapPin, CheckCircle2, AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { linkDeviceByQr } from "@/lib/api";

type Phase =
  | "checking-auth"
  | "need-login"
  | "locating"
  | "linking"
  | "success"
  | "error";

export default function LinkDevicePage() {
  const params = useParams<{ qrCodeId: string }>();
  const router = useRouter();
  const qrCodeId = params?.qrCodeId;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  const [phase, setPhase] = useState<Phase>("checking-auth");
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const startedRef = useRef(false);

  const loginHref = `/auth/login?next=${encodeURIComponent(`/link-device/${qrCodeId || ""}`)}`;

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  const completeLink = useCallback(async () => {
    if (!qrCodeId) {
      setPhase("error");
      setError("Missing QR code id");
      return;
    }

    setError(null);
    setPhase("locating");

    try {
      const location = await getLocation();
      setPhase("linking");

      const result = await linkDeviceByQr({
        qrCodeId,
        ...(location ? { location } : {}),
      });

      setDeviceName(result.device?.name || "Device");
      setPhase("success");
      setTimeout(() => router.replace("/dashboard"), 2200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to link device";
      // Session lost — send to login with return URL (no hard bounce loop)
      if (/log in|session expired|authentication failed/i.test(message)) {
        setPhase("need-login");
        setError("Please sign in again to finish linking.");
        return;
      }
      setPhase("error");
      setError(message);
    }
  }, [getLocation, qrCodeId, router]);

  useEffect(() => {
    if (!isInitialized) {
      setPhase("checking-auth");
      return;
    }

    if (!isAuthenticated) {
      startedRef.current = false;
      setPhase("need-login");
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;
    void completeLink();
  }, [isInitialized, isAuthenticated, completeLink]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Smartphone className="w-7 h-7 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              TrackGuard
            </span>
          </Link>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Link this device</h1>
            <p className="text-sm text-gray-400">
              Completes QR pairing for code{" "}
              <span className="font-mono text-gray-300 break-all">{qrCodeId}</span>
            </p>

            {phase === "checking-auth" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-gray-400">Checking session…</p>
              </div>
            )}

            {phase === "need-login" && (
              <div className="space-y-4 py-2">
                <p className="text-gray-300">
                  Sign in with the <strong>same account</strong> that generated this QR code.
                </p>
                {error && <p className="text-amber-300 text-sm">{error}</p>}
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={loginHref}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to continue
                  </Link>
                </Button>
              </div>
            )}

            {phase === "locating" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <MapPin className="h-8 w-8 text-green-400 animate-pulse" />
                <p className="text-gray-400">Getting this device&apos;s location…</p>
                <p className="text-xs text-gray-500">Allow location when prompted</p>
                {user?.email && (
                  <p className="text-xs text-gray-500">Signed in as {user.email}</p>
                )}
              </div>
            )}

            {phase === "linking" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-gray-400">Linking device…</p>
              </div>
            )}

            {phase === "success" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <p className="text-white font-medium">
                  {deviceName ? `${deviceName} linked` : "Device linked"}
                </p>
                <p className="text-sm text-gray-400">Opening dashboard…</p>
              </div>
            )}

            {phase === "error" && (
              <div className="space-y-4 py-2">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      startedRef.current = true;
                      void completeLink();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try again
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={loginHref}>Sign in again</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
