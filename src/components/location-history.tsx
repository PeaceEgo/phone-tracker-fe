"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp, Calendar, Smartphone } from "lucide-react"

export function LocationHistory() {
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
      borderColor: "border-blue-500/30",
    },
    {
      title: "Distance Traveled",
      value: "12.4 km",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Add gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      {/* Floating particles */}
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

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-4">
            Location History
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Track your location data and movement patterns with detailed insights
          </p>
        </motion.div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card
                className={`bg-white/5 border ${stat.borderColor} backdrop-blur-xl hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-purple-500/10`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-4xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300 border ${stat.borderColor}`}
                    >
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Location History Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-white text-2xl flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                Location History Details
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  {locationData.length} Records
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left text-gray-300 font-semibold py-6 px-8 uppercase tracking-wider text-sm">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-400" />
                          Device Name
                        </div>
                      </th>
                      <th className="text-left text-gray-300 font-semibold py-6 px-8 uppercase tracking-wider text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-400" />
                          Location
                        </div>
                      </th>
                      <th className="text-left text-gray-300 font-semibold py-6 px-8 uppercase tracking-wider text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          Date
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationData.map((location, index) => (
                      <motion.tr
                        key={location.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="border-b border-white/5 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="py-6 px-8">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30 px-3 py-1.5 font-medium"
                          >
                            {location.device}
                          </Badge>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                            <span className="text-white font-medium text-lg group-hover:text-blue-200 transition-colors">
                              {location.location}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                            {location.timestamp}
                          </span>
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
    </div>
  )
}
