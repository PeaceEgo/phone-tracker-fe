"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, MapPin, Shield, Activity, TrendingUp, Battery, Clock, Plus } from "lucide-react";

interface Position {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export function DashboardOverview() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag and generate positions
    setIsClient(true);
    const newPositions = Array.from({ length: 8 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setPositions(newPositions);
  }, []);

  const stats = [
    {
      title: "Registered Devices",
      value: "3",
      icon: Smartphone,
      change: "+1 this week",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      trend: "up",
    },
    {
      title: "Active Tracking",
      value: "2",
      icon: Activity,
      change: "Currently online",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: "stable",
    },
    {
      title: "Locations Today",
      value: "47",
      icon: MapPin,
      change: "+12 from yesterday",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      trend: "up",
    },
    {
      title: "Security Alerts",
      value: "0",
      icon: Shield,
      change: "All clear",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      trend: "stable",
    },
  ];

  const recentDevices = [
    {
      name: "iPhone 15 Pro",
      status: "Online",
      lastSeen: "2 min ago",
      battery: 85,
      location: "Home",
    },
    {
      name: "Samsung Galaxy S24",
      status: "Online",
      lastSeen: "5 min ago",
      battery: 92,
      location: "Office",
    },
    {
      name: "iPad Air",
      status: "Offline",
      lastSeen: "2 hours ago",
      battery: 45,
      location: "Unknown",
    },
  ];

  const quickActions = [
    {
      title: "Register New Device",
      description: "Add a new device to track",
      icon: Plus,
      gradient: "from-blue-500 to-purple-600",
      hoverGradient: "from-blue-600 to-purple-700",
    },
    {
      title: "View Location History",
      description: "See past device locations",
      icon: MapPin,
      variant: "outline",
    },
    {
      title: "Configure Alerts",
      description: "Set up notifications",
      icon: Shield,
      variant: "outline",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Add gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      {/* Add floating particles */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {positions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              style={{
                left: pos.left,
                top: pos.top,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: pos.duration,
                repeat: Number.POSITIVE_INFINITY,
                delay: pos.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 text-lg">Monitor your devices and tracking activity in real-time</p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                All Systems Active
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <p className="text-xs text-gray-400 flex items-center">
                        {stat.trend === "up" && <TrendingUp className="w-3 h-3 mr-1 text-green-400" />}
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Activity className="w-6 h-6 mr-3 text-blue-400" />
                  Device Status
                  <Badge className="ml-auto bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {recentDevices.filter((d) => d.status === "Online").length} Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentDevices.map((device, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Smartphone className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{device.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {device.lastSeen}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {device.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{device.battery}%</span>
                        <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              device.battery > 50
                                ? "bg-green-400"
                                : device.battery > 20
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${device.battery}%` }}
                          />
                        </div>
                      </div>
                      <Badge
                        variant={device.status === "Online" ? "default" : "secondary"}
                        className={
                          device.status === "Online"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            device.status === "Online" ? "bg-green-400 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        {device.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action.gradient ? (
                      <Button
                        className={`w-full p-4 h-auto bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white transition-all duration-300 group`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-left">
                            <div className="font-semibold">{action.title}</div>
                            <div className="text-sm opacity-90">{action.description}</div>
                          </div>
                          <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full p-4 h-auto border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-left">
                            <div className="font-semibold">{action.title}</div>
                            <div className="text-sm text-gray-400">{action.description}</div>
                          </div>
                          <action.icon className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
                        </div>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">System Health</h3>
                      <p className="text-gray-300 text-sm">All tracking services operational</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400">
                        <span>Uptime: 99.9%</span>
                        <span>•</span>
                        <span>Last check: 30s ago</span>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}