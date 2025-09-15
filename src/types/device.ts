export interface Device {
  id: string 
  name: string
  status: string
  location: string 
  coordinates: { lat: number; lng: number; display: string }
  lastUpdate: string
}