"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QrCode, Loader2, Copy, RefreshCw, Target, MapPin, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import {
  deviceLinkPath,
  generateDeviceQr,
  getQrLinkStatus,
  type QrLinkStatus,
} from "@/lib/api"

interface QRCodeData {
  qrCodeId: string
  qrCodeImage: string
  linkUrl: string
}

interface QRCodeRegistrationProps {
  onDeviceRegistered: () => void
}

export function QRCodeRegistration({ onDeviceRegistered }: QRCodeRegistrationProps) {
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState<"android" | "ios">("android")
  const [showQRCode, setShowQRCode] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [qrCodeExpiry, setQrCodeExpiry] = useState(0)
  const [isRegeneratingQR, setIsRegeneratingQR] = useState(false)
  const [linkStatus, setLinkStatus] = useState<QrLinkStatus | null>(null)
  const [linkedDeviceName, setLinkedDeviceName] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handledLinkedRef = useRef(false)

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const resetQrUi = () => {
    clearPoll()
    setShowQRCode(false)
    setQrCodeData(null)
    setQrCodeExpiry(0)
    setLinkStatus(null)
    setLinkedDeviceName(null)
    handledLinkedRef.current = false
  }

  useEffect(() => {
    if (!qrCodeData || qrCodeExpiry <= 0) return

    const interval = setInterval(() => {
      setQrCodeExpiry((prev) => {
        if (prev <= 1) {
          clearPoll()
          setLinkStatus("expired")
          toast.error("QR code has expired. Please generate a new one.")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeData?.qrCodeId])

  useEffect(() => {
    clearPoll()
    handledLinkedRef.current = false

    if (!qrCodeData?.qrCodeId || !showQRCode) return

    const poll = async () => {
      try {
        const result = await getQrLinkStatus(qrCodeData.qrCodeId)
        setLinkStatus(result.status)

        if (result.status === "linked" && !handledLinkedRef.current) {
          handledLinkedRef.current = true
          clearPoll()
          setLinkedDeviceName(result.device?.name || deviceName)
          toast.success(
            result.device?.name
              ? `${result.device.name} linked successfully`
              : "Device linked successfully"
          )
          onDeviceRegistered()
          setTimeout(() => resetQrUi(), 2500)
        }

        if (result.status === "expired" || result.status === "not_found") {
          clearPoll()
          if (result.status === "expired") {
            setQrCodeExpiry(0)
            toast.error("QR code expired")
          }
        }
      } catch (err) {
        console.error("QR status poll failed:", err)
      }
    }

    void poll()
    pollRef.current = setInterval(() => void poll(), 2000)

    return () => clearPoll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeData?.qrCodeId, showQRCode])

  const generateQRCode = async () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name for QR code registration")
      return
    }

    setIsGeneratingQR(true)
    handledLinkedRef.current = false
    setLinkStatus("pending")
    setLinkedDeviceName(null)

    try {
      const data = await generateDeviceQr({
        name: deviceName.trim(),
        type: deviceType,
      })

      if (!data.qrCodeId) {
        throw new Error("Invalid QR response — missing qrCodeId")
      }

      const linkUrl = deviceLinkPath(data.qrCodeId)

      // Prefer backend image (already HTTPS /link-device/...), else build locally
      const qrCodeImage =
        data.qrCodeImage && data.qrCodeImage.startsWith("data:")
          ? data.qrCodeImage
          : await QRCode.toDataURL(linkUrl, {
              errorCorrectionLevel: "M",
              margin: 2,
              width: 384,
              color: { dark: "#000000", light: "#ffffff" },
            })

      setQrCodeData({
        qrCodeId: data.qrCodeId,
        qrCodeImage,
        linkUrl,
      })
      setShowQRCode(true)
      setQrCodeExpiry(typeof data.expiresIn === "number" ? data.expiresIn : 900)
      toast.success("QR ready — scan with any phone camera or browser")
    } catch (err) {
      console.error("QR generation error:", err)
      toast.error(err instanceof Error ? err.message : "Unable to generate QR code")
      setLinkStatus(null)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const regenerateQRCode = async () => {
    setIsRegeneratingQR(true)
    clearPoll()
    await generateQRCode()
    setIsRegeneratingQR(false)
  }

  const copyLinkingUrl = async () => {
    if (!qrCodeData?.linkUrl) return
    try {
      await navigator.clipboard.writeText(qrCodeData.linkUrl)
      toast.success("Link copied")
    } catch {
      toast.error("Failed to copy URL")
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const statusLabel =
    linkStatus === "pending"
      ? "Waiting for device to open the link…"
      : linkStatus === "linked"
        ? "Device linked"
        : linkStatus === "expired"
          ? "Expired"
          : linkStatus === "not_found"
            ? "QR not found"
            : null

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-xl">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <QrCode className="h-5 w-5 text-green-400" />
          </div>
          QR Code Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-300 font-medium mb-1">Scan to open link page</h3>
              <p className="text-sm text-gray-400">
                QR opens{" "}
                <code className="text-blue-300">/link-device/&#123;id&#125;</code> on the web app.
                The phone must sign in as the same user, then we call{" "}
                <code className="text-blue-300">POST /devices/link-by-qr</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrDeviceName" className="text-gray-300 font-medium">
            Device Name
          </Label>
          <Input
            id="qrDeviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. Sarah's iPhone"
            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrDeviceType" className="text-gray-300 font-medium">
            Expected Device Type
          </Label>
          <select
            id="qrDeviceType"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as "android" | "ios")}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="android" className="bg-gray-800">
              Android
            </option>
            <option value="ios" className="bg-gray-800">
              iOS
            </option>
          </select>
        </div>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="text-green-300 font-medium mb-1">Location from scanning device</h4>
              <p className="text-sm text-gray-400">
                The link page reads GPS on the phone and sends it with the link request.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => void generateQRCode()}
          disabled={isGeneratingQR || !deviceName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isGeneratingQR ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </>
          )}
        </Button>

        <AnimatePresence>
          {showQRCode && qrCodeData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Separator className="my-4 bg-white/10" />
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg text-center space-y-4">
                <div className="inline-block rounded-lg bg-white p-3">
                  <Image
                    src={qrCodeData.qrCodeImage}
                    alt="Device Registration QR Code"
                    width={192}
                    height={192}
                    unoptimized
                    className="w-48 h-48"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-white font-medium">
                    {deviceName} ({deviceType})
                  </p>
                  <p className="text-xs text-gray-400 break-all font-mono px-2">
                    {qrCodeData.linkUrl}
                  </p>
                  {statusLabel && (
                    <p
                      className={`text-sm flex items-center justify-center gap-2 ${
                        linkStatus === "linked"
                          ? "text-green-400"
                          : linkStatus === "expired" || linkStatus === "not_found"
                            ? "text-red-400"
                            : "text-blue-300"
                      }`}
                    >
                      {linkStatus === "linked" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : linkStatus === "pending" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {linkStatus === "linked" && linkedDeviceName
                        ? `${linkedDeviceName} linked`
                        : statusLabel}
                    </p>
                  )}
                  {qrCodeExpiry > 0 && linkStatus === "pending" && (
                    <p className="text-sm text-green-400 font-mono">
                      Expires in: {formatTime(qrCodeExpiry)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => void copyLinkingUrl()}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                  </Button>
                  <Button
                    onClick={() => void regenerateQRCode()}
                    disabled={isRegeneratingQR}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {isRegeneratingQR ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>

                <Button onClick={resetQrUi} variant="ghost" size="sm" className="w-full">
                  Close QR Code
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
