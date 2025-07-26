"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  Shield,
  Download,
  Trash2,
  Key,
  Mail,
  Phone,
  Lock,
  Eye,
  Database,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  AlertTriangle,
} from "lucide-react"

export function SettingsPanel() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  })

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    locationHistory: true,
    notifications: true,
  })

  const [isUpdating, setIsUpdating] = useState(false)

  const sessions = [
    {
      id: 1,
      device: "iPhone 15 Pro",
      deviceType: "mobile",
      location: "New York, NY",
      lastActive: "Active now",
      current: true,
      ip: "192.168.1.100",
    },
    {
      id: 2,
      device: "MacBook Pro",
      deviceType: "desktop",
      location: "New York, NY",
      lastActive: "2 hours ago",
      current: false,
      ip: "192.168.1.101",
    },
    {
      id: 3,
      device: "iPad Air",
      deviceType: "tablet",
      location: "Brooklyn, NY",
      lastActive: "1 day ago",
      current: false,
      ip: "192.168.1.102",
    },
  ]

  const stats = [
    {
      title: "Active Sessions",
      value: sessions.length.toString(),
      icon: Settings,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Privacy Controls",
      value: Object.values(privacy).filter(Boolean).length.toString(),
      total: Object.keys(privacy).length,
      icon: Shield,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Data Storage",
      value: "2.4 GB",
      icon: Database,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ]

  const privacyControls = [
    {
      key: "dataSharing" as keyof typeof privacy,
      title: "Data Sharing",
      description: "Share anonymized data to improve services",
      icon: Database,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      key: "analytics" as keyof typeof privacy,
      title: "Analytics",
      description: "Help improve the app with usage analytics",
      icon: Eye,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      key: "locationHistory" as keyof typeof privacy,
      title: "Location History",
      description: "Store location data for historical tracking",
      icon: Settings,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      key: "notifications" as keyof typeof privacy,
      title: "Push Notifications",
      description: "Receive notifications about device activity",
      icon: Mail,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ]

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false)
    }, 2000)
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      case "desktop":
        return Monitor
      default:
        return Settings
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
            Settings
          </h1>
          <p className="text-gray-400 text-lg">Manage your account, privacy preferences, and security settings</p>
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
          {/* Profile Settings */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Label htmlFor="name" className="text-gray-300 font-medium">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                      className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Label htmlFor="phone" className="text-gray-300 font-medium">
                    Phone Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 group"
                  >
                    {isUpdating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <Key className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Change Password
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <Lock className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Enable Two-Factor Authentication
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4 border-t border-white/10"
                >
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Login Notifications
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Email notifications for new logins</p>
                      <p className="text-xs text-gray-400 mt-1">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      defaultChecked
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                    />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Privacy Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-400" />
                </div>
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacyControls.map((control, index) => (
                <motion.div
                  key={control.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${control.bgColor} group-hover:scale-110 transition-transform`}>
                      <control.icon className={`h-4 w-4 ${control.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{control.title}</p>
                      <p className="text-sm text-gray-400">{control.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy[control.key]}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, [control.key]: checked }))}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-400" />
                </div>
                Active Sessions
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{sessions.length} Total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session, index) => {
                  const DeviceIcon = getDeviceIcon(session.deviceType)
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <DeviceIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{session.device}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{session.location}</span>
                            <span>•</span>
                            <span>{session.lastActive}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">IP: {session.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.current ? (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            Current
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Database className="h-5 w-5 text-red-400" />
                </div>
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9 }}>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Export Data
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }}>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Request Data Report
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }}>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-900/20 bg-transparent transition-all duration-300 group"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Delete Account
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-200 font-medium mb-1">Important Information</p>
                    <p className="text-sm text-gray-400">
                      Data exports include location history, device information, and account settings. Account deletion
                      is permanent and cannot be undone. All your data will be permanently removed from our servers.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
