"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Radio,
  MapPin,
  Battery,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Signal,
  Navigation,
  Clock,
  Target,
  Zap,
} from "lucide-react"
import { TrackingMap } from "./map-integration"

export function RealTimeTracking() {
  const [isTracking, setIsTracking] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<(typeof devices)[0] | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  const devices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      status: "online",
      location: "Central Park, New York",
      coordinates: { lat: 40.7829, lng: -73.9654, display: "40.7829° N, 73.9654° W" },
      lastUpdate: "2 seconds ago",
      battery: 85,
      signal: "Strong",
      speed: "0 mph",
      accuracy: "5m",
      activity: "Stationary",
      owner: "Sarah",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      status: "online",
      location: "Brooklyn Bridge",
      coordinates: { lat: 40.7061, lng: -73.9969, display: "40.7061° N, 73.9969° W" },
      lastUpdate: "5 seconds ago",
      battery: 92,
      signal: "Strong",
      speed: "25 mph",
      accuracy: "3m",
      activity: "Moving",
      owner: "John",
    },
    {
      id: 3,
      name: "iPad Air",
      status: "offline",
      location: "Home",
      coordinates: { lat: 40.6782, lng: -73.9442, display: "40.6782° N, 73.9442° W" },
      lastUpdate: "2 hours ago",
      battery: 45,
      signal: "Weak",
      speed: "0 mph",
      accuracy: "12m",
      activity: "Offline",
      owner: "Emma",
    },
  ]

  const stats = [
    {
      title: "Online Devices",
      value: devices.filter((d) => d.status === "online").length.toString(),
      total: devices.length,
      icon: Radio,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Active Tracking",
      value: isTracking ? "ON" : "OFF",
      icon: Activity,
      color: isTracking ? "text-blue-400" : "text-gray-400",
      bgColor: isTracking ? "bg-blue-500/20" : "bg-gray-500/20",
    },
    {
      title: "Avg Accuracy",
      value: "6m",
      icon: Target,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Last Update",
      value: "2s ago",
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ]

  const handleDeviceClick = (device: (typeof devices)[0]) => {
    setSelectedDevice(device)
    console.log("Device clicked:", device.name)
  }

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
            Real-time Tracking
          </h1>
          <p className="text-gray-400 text-lg">Monitor device locations and status with live updates</p>
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
                      <p className="text-2xl font-bold text-white mt-1">
                        {stat.value}
                        {stat.total && <span className="text-sm text-gray-400">/{stat.total}</span>}
                      </p>
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

        {/* Control Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Radio className="h-5 w-5 text-blue-400" />
                </div>
                Tracking Controls
                <div className="ml-auto flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
                  />
                  <span className="text-sm text-white">{isTracking ? "Live" : "Paused"}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <Switch
                    checked={isTracking}
                    onCheckedChange={setIsTracking}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                  />
                  <span className="text-white font-medium">Real-time Tracking</span>
                  {isTracking && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                  />
                  <span className="text-white font-medium">Auto Refresh (30s)</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3"
                >
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Refreshing..." : "Refresh Now"}
                  </Button>

                  <Button
                    onClick={() => setIsTracking(!isTracking)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group"
                  >
                    {isTracking ? (
                      <Pause className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    {isTracking ? "Pause All" : "Start All"}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-400" />
                </div>
                Live Tracking Map
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {devices.filter((d) => d.status === "online").length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingMap devices={devices} height="h-[600px]" onDeviceClick={handleDeviceClick} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{device.name}</CardTitle>
                      <p className="text-sm text-gray-400">{device.owner}'s device</p>
                    </div>
                    <Badge
                      variant={device.status === "online" ? "default" : "secondary"}
                      className={`${
                        device.status === "online"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      } flex items-center gap-2`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.status === "online" ? "bg-green-400 animate-pulse" : "bg-gray-400"
                        }`}
                      />
                      {device.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm font-medium">{device.location}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{device.coordinates.display}</p>
                    <div className="flex items-center gap-2 ml-6">
                      <Navigation className="h-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{device.activity}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Battery</p>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{device.battery}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            device.battery > 50 ? "bg-green-400" : device.battery > 20 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${device.battery}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Signal</p>
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{device.signal}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`w-1 h-3 rounded-full ${
                              (device.signal === "Strong" && bar <= 4) ||
                              (device.signal === "Medium" && bar <= 2) ||
                              (device.signal === "Weak" && bar <= 1)
                                ? "bg-blue-400"
                                : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Speed</p>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{device.speed}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs">Accuracy</p>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{device.accuracy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-400">Last update: {device.lastUpdate}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group"
                        onClick={() => setSelectedDevice(device)}
                      >
                        <MapPin className="h-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                        Locate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300"
                      >
                        <Clock className="h-3 h-3 mr-1" />
                        History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
