export interface Device {
  deviceId: string
  name: string
  type: "android" | "ios"
  location: {
    type: string
    coordinates: [number, number]
    
  }
  locationName: string
  qrCodeId: string
  qrCodeImage?: string
  registrationMethod: "direct" | "qr"
  isActive: boolean
  registeredAt: string
}

export interface QRCodeData {
  qrCodeId: string
  qrCodeImage: string
  linkingUrl: string
  expiresAt: string
  deviceName: string
  deviceType: "android" | "ios"
}

export interface ApiResponse<T> {
  message: string
  device?: T
  devices?: T[]
  qrCode?: QRCodeData
}
