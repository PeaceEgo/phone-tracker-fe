"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QrCode, Loader2, Copy, RefreshCw, Target, MapPin } from 'lucide-react'
import { toast } from "sonner"
import Image from "next/image"

interface QRCodeData {
  qrCodeId: string
  qrCodeImage: string
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
  const [qrCodeExpiry, setQrCodeExpiry] = useState<number>(0)
  const [isRegeneratingQR, setIsRegeneratingQR] = useState(false)

  // Timer for QR code expiry
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (qrCodeData && qrCodeExpiry > 0) {
      interval = setInterval(() => {
        setQrCodeExpiry((prev) => {
          if (prev <= 1) {
            setQrCodeData(null)
            setShowQRCode(false)
            toast.error("QR code has expired. Please generate a new one.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [qrCodeData, qrCodeExpiry])

  // Generate QR code for device linking
  const generateQRCode = async () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name for QR code registration")
      return
    }

    setIsGeneratingQR(true)
    try {
      const payload = {
        name: deviceName,
        type: deviceType,
      }

      const response = await fetch("https://phone-tracker-be.onrender.com/api/devices/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to generate QR code")
      }

      const data = await response.json()
      if (data.qrCodeId && data.qrCodeImage) {
        setQrCodeData({
          qrCodeId: data.qrCodeId,
          qrCodeImage: data.qrCodeImage
        })
        setShowQRCode(true)
        // Set expiry timer (10 minutes = 600 seconds)
        setQrCodeExpiry(600)
        toast.success("QR code generated! Scan it with the target device to complete registration.")
        // Notify parent that a device might be registered soon
        onDeviceRegistered()
      }
    } catch (err) {
      console.error("QR generation error:", err)
      toast.error("Unable to generate QR code. Please try again.")
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Regenerate QR code
  const regenerateQRCode = async () => {
    setIsRegeneratingQR(true)
    await generateQRCode()
    setIsRegeneratingQR(false)
  }

  const copyLinkingUrl = async () => {
    if (qrCodeData?.qrCodeId) {
      try {
        await navigator.clipboard.writeText(`trackguard://link-device/${qrCodeData.qrCodeId}`)
        toast.success("Linking URL copied to clipboard!")
      } catch (err) {
        console.error("Clipboard copy error:", err)
        toast.error("Failed to copy URL")
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

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
              <h3 className="text-blue-300 font-medium mb-1">QR Code Registration</h3>
              <p className="text-sm text-gray-400">
                Generate a QR code with device details. When the target device scans this code, it will
                automatically register using <strong>its own current location</strong> and device
                information.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="qrDeviceName" className="text-gray-300 font-medium">
            Device Name
          </Label>
          <Input
            id="qrDeviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Enter device name (e.g., Sarah's iPhone)"
            className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="qrDeviceType" className="text-gray-300 font-medium">
            Expected Device Type
          </Label>
          <select
            id="qrDeviceType"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as "android" | "ios")}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="android" className="bg-gray-800">
              Android
            </option>
            <option value="ios" className="bg-gray-800">
              iOS
            </option>
          </select>
          <p className="text-xs text-gray-500">
            This helps optimize the QR code for the target device platform.
          </p>
        </motion.div>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="text-green-300 font-medium mb-1">Automatic Location Detection</h4>
              <p className="text-sm text-gray-400">
                When the target device scans this QR code, it will automatically use its current GPS
                location for registration. No manual location setup required!
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={generateQRCode}
            disabled={isGeneratingQR || !deviceName.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white transition-all duration-300 group disabled:opacity-50"
          >
            {isGeneratingQR ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
                Generating QR Code...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Generate QR Code for Remote Device
              </>
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {showQRCode && qrCodeData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-4 bg-white/10" />
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mx-auto mb-4 rounded-lg flex items-center justify-center"
                  >
                    <Image
                      src={qrCodeData.qrCodeImage}
                      alt="Device Registration QR Code"
                      width={192}
                      height={192}
                      className="w-48 h-48 rounded-lg shadow-lg border border-white/10"
                    />
                  </motion.div>
                  <div className="space-y-2 mb-4">
                    <p className="text-white font-medium">
                      Have the target device scan this QR code
                    </p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Device: {deviceName} ({deviceType})</p>
                      <p className="text-green-400 flex items-center justify-center gap-1">
                        <Target className="h-3 w-3" />
                        Location will be detected automatically from scanning device
                      </p>
                    </div>
                    {qrCodeExpiry > 0 && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-sm text-green-400 font-mono">
                          Expires in: {formatTime(qrCodeExpiry)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={copyLinkingUrl}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        onClick={regenerateQRCode}
                        disabled={isRegeneratingQR}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        {isRegeneratingQR ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        setShowQRCode(false)
                        setQrCodeData(null)
                        setQrCodeExpiry(0)
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      Close QR Code
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}