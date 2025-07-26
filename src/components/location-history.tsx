"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Filter,
  Download,
  Clock,
  Search,
  Calendar,
  Smartphone,
  Battery,
  Target,
  TrendingUp,
} from "lucide-react"
import { TrackingMap } from "./map-integration"

export function LocationHistory() {
  const [selectedDevice, setSelectedDevice] = useState("all")
  const [dateRange, setDateRange] = useState("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<(typeof locationData)[0] | null>(null)

  const locationData = [
    {
      id: 1,
      device: "iPhone 15 Pro",
      location: "Central Park, New York",
      address: "Central Park West, New York, NY 10024",
      coordinates: { lat: 40.7829, lng: -73.9654 },
      timestamp: "2024-01-20 14:30:25",
      accuracy: "5m",
      battery: 85,
      duration: "45 min",
      activity: "Walking",
    },
    {
      id: 2,
      device: "iPhone 15 Pro",
      location: "Starbucks Coffee",
      address: "1585 Broadway, New York, NY 10036",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      timestamp: "2024-01-20 12:15:10",
      accuracy: "3m",
      battery: 92,
      duration: "30 min",
      activity: "Stationary",
    },
    {
      id: 3,
      device: "Samsung Galaxy S24",
      location: "Home",
      address: "123 Main Street, Brooklyn, NY 11201",
      coordinates: { lat: 40.6892, lng: -73.9442 },
      timestamp: "2024-01-20 09:45:33",
      accuracy: "8m",
      battery: 78,
      duration: "8 hours",
      activity: "Stationary",
    },
    {
      id: 4,
      device: "iPhone 15 Pro",
      location: "Times Square",
      address: "Times Square, New York, NY 10036",
      coordinates: { lat: 40.758, lng: -73.9855 },
      timestamp: "2024-01-20 08:20:15",
      accuracy: "12m",
      battery: 95,
      duration: "15 min",
      activity: "Walking",
    },
  ]

  const stats = [
    {
      title: "Total Locations",
      value: locationData.length.toString(),
      icon: MapPin,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Distance Traveled",
      value: "12.4 km",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Average Accuracy",
      value: "7m",
      icon: Target,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Active Time",
      value: "6.5 hrs",
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Add gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      {/* Add floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
            Location History
          </h1>
          <p className="text-gray-400 text-lg">View detailed location timeline and comprehensive tracking history</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-400" />
                </div>
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Device</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="all" className="bg-gray-800">
                        All Devices
                      </option>
                      <option value="iphone" className="bg-gray-800">
                        iPhone 15 Pro
                      </option>
                      <option value="samsung" className="bg-gray-800">
                        Samsung Galaxy S24
                      </option>
                      <option value="ipad" className="bg-gray-800">
                        iPad Air
                      </option>
                    </select>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="today" className="bg-gray-800">
                        Today
                      </option>
                      <option value="week" className="bg-gray-800">
                        This Week
                      </option>
                      <option value="month" className="bg-gray-800">
                        This Month
                      </option>
                      <option value="custom" className="bg-gray-800">
                        Custom Range
                      </option>
                    </select>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search Location</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search addresses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-end gap-2"
                >
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map View */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-400" />
                  </div>
                  Location History Map
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {locationData.length} Points
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingMap
                  devices={locationData.map((loc) => ({
                    id: loc.id,
                    name: loc.device,
                    status: "online",
                    location: loc.location,
                    coordinates: {
                      lat: loc.coordinates.lat,
                      lng: loc.coordinates.lng,
                      display: `${loc.coordinates.lat}° N, ${loc.coordinates.lng}° W`,
                    },
                    lastUpdate: loc.timestamp,
                    battery: loc.battery,
                    signal: "Strong",
                    speed: "0 mph",
                    accuracy: loc.accuracy,
                    activity: loc.activity,
                    owner: "User",
                  }))}
                  height="h-96"
                  showTrails={true}
                  onDeviceClick={(device) => {
                    const originalLocation = locationData.find((loc) => loc.id === device.id)
                    if (originalLocation) {
                      setSelectedLocation(originalLocation)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {locationData.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedLocation(location)}
                    >
                      {index !== locationData.length - 1 && (
                        <div className="absolute left-4 top-10 w-0.5 h-16 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30"></div>
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{location.location}</p>
                          <p className="text-xs text-gray-400 truncate">{location.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{location.timestamp}</p>
                            <span className="text-gray-600">•</span>
                            <p className="text-xs text-gray-500">{location.duration}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                              {location.device}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-500/20 text-green-300 border-green-500/30"
                            >
                              {location.activity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">Detailed Location History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Device</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Location</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Address</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Timestamp</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Duration</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Accuracy</th>
                      <th className="text-left text-gray-300 font-medium py-4 px-2">Battery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationData.map((location, index) => (
                      <motion.tr
                        key={location.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 group"
                      >
                        <td className="py-4 px-2">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {location.device}
                          </Badge>
                        </td>
                        <td className="py-4 px-2 text-white font-medium">{location.location}</td>
                        <td className="py-4 px-2 text-gray-400 max-w-xs truncate">{location.address}</td>
                        <td className="py-4 px-2 text-gray-400 text-sm">{location.timestamp}</td>
                        <td className="py-4 px-2 text-gray-400 text-sm">{location.duration}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-green-400" />
                            <span className="text-gray-400 text-sm">{location.accuracy}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <Battery className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400 text-sm">{location.battery}%</span>
                            <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  location.battery > 50
                                    ? "bg-green-400"
                                    : location.battery > 20
                                      ? "bg-yellow-400"
                                      : "bg-red-400"
                                }`}
                                style={{ width: `${location.battery}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  )
}
