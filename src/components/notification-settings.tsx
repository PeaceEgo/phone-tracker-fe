"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  MapPin,
  Battery,
  Shield,
  Clock,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  Volume2,
  Smartphone,
  Save,
} from "lucide-react"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    locationAlerts: true,
    batteryAlerts: true,
    geofenceAlerts: true,
    offlineAlerts: true,
    speedAlerts: false,
    sosAlerts: true,
  })

  const [thresholds, setThresholds] = useState({
    battery: 20,
    offline: 15,
    speed: 70,
  })

  const geofences = [
    { id: 1, name: "Home", address: "123 Main St, Brooklyn, NY", radius: "100m", active: true },
    { id: 2, name: "Work", address: "456 Office Blvd, Manhattan, NY", radius: "50m", active: true },
    { id: 3, name: "School", address: "789 Education Ave, Queens, NY", radius: "200m", active: false },
  ]

  const recentAlerts = [
    {
      id: 1,
      type: "geofence",
      message: "iPhone 15 Pro left Home area",
      time: "2 hours ago",
      device: "iPhone 15 Pro",
      priority: "medium",
    },
    {
      id: 2,
      type: "battery",
      message: "Samsung Galaxy S24 battery below 20%",
      time: "4 hours ago",
      device: "Samsung Galaxy S24",
      priority: "high",
    },
    {
      id: 3,
      type: "offline",
      message: "iPad Air went offline",
      time: "6 hours ago",
      device: "iPad Air",
      priority: "low",
    },
  ]

  const alertTypes = [
    {
      key: "locationAlerts" as keyof typeof notifications,
      icon: MapPin,
      title: "Location Alerts",
      description: "Notify when devices change location",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      key: "batteryAlerts" as keyof typeof notifications,
      icon: Battery,
      title: "Battery Alerts",
      description: "Notify when battery is low",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      key: "geofenceAlerts" as keyof typeof notifications,
      icon: Shield,
      title: "Geofence Alerts",
      description: "Notify when entering/leaving areas",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      key: "offlineAlerts" as keyof typeof notifications,
      icon: Clock,
      title: "Offline Alerts",
      description: "Notify when devices go offline",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      key: "speedAlerts" as keyof typeof notifications,
      icon: AlertTriangle,
      title: "Speed Alerts",
      description: "Notify when speed limits are exceeded",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      key: "sosAlerts" as keyof typeof notifications,
      icon: Volume2,
      title: "SOS Alerts",
      description: "Emergency notifications",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
  ]

  const stats = [
    {
      title: "Active Alerts",
      value: Object.values(notifications).filter(Boolean).length.toString(),
      total: Object.keys(notifications).length,
      icon: Bell,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Geofences",
      value: geofences.filter((g) => g.active).length.toString(),
      total: geofences.length,
      icon: Shield,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Recent Alerts",
      value: recentAlerts.length.toString(),
      icon: AlertTriangle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ]

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleThresholdChange = (key: keyof typeof thresholds, value: string) => {
    setThresholds((prev) => ({ ...prev, [key]: Number.parseInt(value) || 0 }))
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "geofence":
        return "bg-blue-500"
      case "battery":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
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
            Notification Settings
          </h1>
          <p className="text-gray-400 text-lg">Configure alerts and notification preferences for all your devices</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alert Types */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-400" />
                  </div>
                  Alert Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alertTypes.map((alert, index) => (
                  <motion.div
                    key={alert.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${alert.bgColor} group-hover:scale-110 transition-transform`}>
                        <alert.icon className={`h-5 w-5 ${alert.color}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-400">{alert.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[alert.key]}
                      onCheckedChange={() => toggleNotification(alert.key)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Thresholds */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-400" />
                  </div>
                  Alert Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Battery Alert Threshold</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Battery className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={thresholds.battery}
                        onChange={(e) => handleThresholdChange("battery", e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <span className="text-gray-400 font-medium">%</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Offline Alert Delay</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={thresholds.offline}
                        onChange={(e) => handleThresholdChange("offline", e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <span className="text-gray-400 font-medium">minutes</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Speed Alert Threshold</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={thresholds.speed}
                        onChange={(e) => handleThresholdChange("speed", e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <span className="text-gray-400 font-medium">mph</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group">
                    <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Save Thresholds
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Geofences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  Geofences
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {geofences.filter((g) => g.active).length} Active
                  </Badge>
                </CardTitle>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group">
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Add Geofence
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geofences.map((geofence, index) => (
                  <motion.div
                    key={geofence.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{geofence.name}</p>
                        <p className="text-sm text-gray-400">{geofence.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Radius: {geofence.radius}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={geofence.active ? "default" : "secondary"}
                        className={
                          geofence.active
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            geofence.active ? "bg-green-400 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        {geofence.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                Recent Alerts
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {recentAlerts.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className={`w-3 h-3 rounded-full ${getAlertTypeColor(alert.type)} animate-pulse`} />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-400">{alert.time}</p>
                        <span className="text-gray-600">•</span>
                        <Smartphone className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-400">{alert.device}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/10 text-gray-300 border-white/20 text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
