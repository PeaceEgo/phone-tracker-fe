"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { claimDeviceByQr, getPublicQrInfo } from "@/lib/api";

type Phase = "loading" | "ready" | "locating" | "claiming" | "success" | "error";

function LinkDeviceContent() {
  const params = useParams<{ qrCodeId: string }>();
  const searchParams = useSearchParams();
  const qrCodeId = params?.qrCodeId || "";
  const claimToken = searchParams.get("claim") || "";
  const apiFromQuery = searchParams.get("api");

  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const startedRef = useRef(false);

  const getLocation = useCallback((): Promise<
    { latitude: number; longitude: number } | undefined
  > => {
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

  const completeClaim = useCallback(async () => {
    if (!qrCodeId) {
      setPhase("error");
      setError("Missing QR code id");
      return;
    }
    if (!claimToken) {
      setPhase("error");
      setError(
        "This link is missing a claim token. Generate a new QR from the dashboard."
      );
      return;
    }

    setError(null);
    setPhase("locating");

    try {
      const location = await getLocation();
      setPhase("claiming");

      const result = await claimDeviceByQr({
        qrCodeId,
        claimToken,
        apiBase: apiFromQuery,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        ...(location ? { location } : {}),
      });

      setDeviceName(result.device?.name || previewName || "Device");
      setPhase("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to link device";
      setPhase("error");
      setError(message);
    }
  }, [apiFromQuery, claimToken, getLocation, previewName, qrCodeId]);

  useEffect(() => {
    if (!qrCodeId || !claimToken) {
      setPhase("error");
      setError(
        !qrCodeId
          ? "Missing QR code id"
          : "This link is missing a claim token. Generate a new QR from the dashboard."
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const info = await getPublicQrInfo(qrCodeId, claimToken, apiFromQuery);
        if (cancelled) return;

        setPreviewName(info.name);
        setPreviewType(info.type);

        if (info.status === "linked") {
          setDeviceName(info.name || "Device");
          setPhase("success");
          return;
        }
        if (info.status === "expired") {
          setPhase("error");
          setError("This QR code has expired. Generate a new one on the dashboard.");
          return;
        }
        if (info.status === "not_found") {
          setPhase("error");
          setError(
            "QR not found. Generate against the production API if you scanned from Vercel."
          );
          return;
        }

        setPhase("ready");
      } catch {
        if (cancelled) return;
        // Still allow claim attempt if info endpoint is down
        setPhase("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiFromQuery, claimToken, qrCodeId]);

  useEffect(() => {
    if (phase !== "ready" || startedRef.current) return;
    startedRef.current = true;
    void completeClaim();
  }, [phase, completeClaim]);

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
              {previewName
                ? `Pairing “${previewName}”${previewType ? ` (${previewType})` : ""}`
                : "No login needed — this one-time link attaches the phone to the account that created the QR."}
            </p>

            {(phase === "loading" || phase === "ready") && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-gray-400">Preparing link…</p>
              </div>
            )}

            {phase === "locating" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <MapPin className="h-8 w-8 text-green-400 animate-pulse" />
                <p className="text-gray-400">Getting this device&apos;s location…</p>
                <p className="text-xs text-gray-500">Allow location when prompted</p>
              </div>
            )}

            {phase === "claiming" && (
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
                <p className="text-sm text-gray-400">
                  You can close this tab. The dashboard will show the device shortly.
                </p>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href="/">Done</Link>
                </Button>
              </div>
            )}

            {phase === "error" && (
              <div className="space-y-4 py-2">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {claimToken && qrCodeId && (
                    <Button
                      onClick={() => {
                        startedRef.current = false;
                        setPhase("ready");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Try again
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/">Back to home</Link>
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

export default function LinkDevicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LinkDeviceContent />
    </Suspense>
  );
}
