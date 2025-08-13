// "use client"

// import { useState, useEffect } from "react"
// import axios from "axios"
// import { QRCodeRegistration } from "./qr-linking-registration"


// export default function QrLinkingWrapper() {
//   const [qrDeviceName, setQrDeviceName] = useState("")
//   const [qrDeviceType, setQrDeviceType] = useState<"android" | "ios">("android")
//   const [showQRCode, setShowQRCode] = useState(false)
//   const [qrCodeData, setQrCodeData] = useState<{ image: string; qrCodeId: string } | null>(null)
//   const [isGeneratingQR, setIsGeneratingQR] = useState(false)
//   const [qrCodeExpiry, setQrCodeExpiry] = useState(60)
//   const [isRegeneratingQR, setIsRegeneratingQR] = useState(false)

//   // Countdown Timer for QR Expiry
//   useEffect(() => {
//     if (showQRCode && qrCodeExpiry > 0) {
//       const timer = setInterval(() => {
//         setQrCodeExpiry((prev) => prev - 1)
//       }, 1000)
//       return () => clearInterval(timer)
//     }
//   }, [showQRCode, qrCodeExpiry])

//   // Generate QR code
//   const generateQRCode = async () => {
//     setIsGeneratingQR(true)
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/devices/qr/generate`,
//         {
//           deviceName: qrDeviceName,
//           deviceType: qrDeviceType,
//         },
//         { withCredentials: true } // for cookie auth
//       )

//       const { qrCodeImage, qrCodeId, expiresIn } = response.data
//       setQrCodeData({ image: qrCodeImage, qrCodeId })
//       setQrCodeExpiry(expiresIn)
//       setShowQRCode(true)
//     } catch (err) {
//       console.error("QR Generation failed", err)
//     } finally {
//       setIsGeneratingQR(false)
//     }
//   }

//   // Regenerate QR
//   const regenerateQRCode = async () => {
//     setIsRegeneratingQR(true)
//     try {
//       await generateQRCode()
//     } finally {
//       setIsRegeneratingQR(false)
//     }
//   }

//   // Copy linking URL
//   const copyLinkingUrl = () => {
//     if (!qrCodeData?.qrCodeId) return
//     const link = `trackguard://link-device/${qrCodeData.qrCodeId}`
//     navigator.clipboard.writeText(link)
//   }

//   return (
//     <QRCodeRegistration
//       qrDeviceName={qrDeviceName}
//       setQrDeviceName={setQrDeviceName}
//       qrDeviceType={qrDeviceType}
//       setQrDeviceType={setQrDeviceType}
//       generateQRCode={generateQRCode}
//       isGeneratingQR={isGeneratingQR}
//       showQRCode={showQRCode}
//       setShowQRCode={setShowQRCode}
//       qrCodeData={qrCodeData}
//       qrCodeExpiry={qrCodeExpiry}
//       copyLinkingUrl={copyLinkingUrl}
//       regenerateQRCode={regenerateQRCode}
//       isRegeneratingQR={isRegeneratingQR}
//     />
//   )
// }
