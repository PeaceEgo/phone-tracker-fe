"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, MapPin, Activity, Plus, RefreshCw, Battery, Clock } from "lucide-react";
import { useDevicesStore } from "@/store/devices";
import { DashboardModal } from "./dashboard-modal";
import { useDeviceSocket } from "@/hooks/use-device-sockets";

interface Position {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

interface LocationHistoryEntry {
  _id: string;
  location: { coordinates: [number, number] };
  locationName: string;
  timestamp: string;
  accuracy?: string;
  battery?: number;
  activity?: string;
}

export function DashboardOverview() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [todayLocations, setTodayLocations] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'register' | 'history'>('register');

  // Get state and actions from devices store
  const { 
    devices, 
    isLoading, 
    error, 
    fetchDevices, 
    fetchLocationHistory,
    updateOnlineStatusFromHistory 
  } = useDevicesStore();

  // Extract device IDs for socket connection
  const deviceIds = devices.map(device => device.deviceId);
  
  // Initialize socket connection for real-time updates
  useDeviceSocket(deviceIds);

  useEffect(() => {
    setIsClient(true);
    const newPositions = Array.from({ length: 6 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setPositions(newPositions);
  }, []);

  // Initial data fetch and location history processing
  useEffect(() => {
    const loadDevicesAndLocationData = async () => {
      // Fetch devices from store
      await fetchDevices();
      
      // If we have devices, fetch additional location data
      if (devices.length > 0) {
        let totalTodayLocations = 0;
        
        for (const device of devices) {
          try {
            const historyData = await fetchLocationHistory(device.deviceId);
            const history: LocationHistoryEntry[] = historyData.history || [];

            // Count today's locations
            const today = new Date().toDateString();
            const todayCount = history.filter(entry => 
              new Date(entry.timestamp).toDateString() === today
            ).length;
            totalTodayLocations += todayCount;

            // Update online status based on latest history entry
            if (history.length > 0) {
              updateOnlineStatusFromHistory(device.deviceId, history[0].timestamp);
            }
          } catch (err) {
            console.error(`Failed to fetch location history for device ${device.deviceId}:`, err);
          }
        }
        
        setTodayLocations(totalTodayLocations);
      }
    };

    loadDevicesAndLocationData();
  }, [fetchDevices, devices.length, fetchLocationHistory, updateOnlineStatusFromHistory]);

  // Refresh handler using store method
  const handleRefresh = async () => {
    await fetchDevices(true); // Force refresh
    
    // Recalculate today's locations after refresh
    let totalTodayLocations = 0;
    for (const device of devices) {
      try {
        const historyData = await fetchLocationHistory(device.deviceId);
        const history: LocationHistoryEntry[] = historyData.history || [];
        
        const today = new Date().toDateString();
        const todayCount = history.filter(entry => 
          new Date(entry.timestamp).toDateString() === today
        ).length;
        totalTodayLocations += todayCount;
      } catch (err) {
        console.error(`Failed to fetch location history for device ${device.deviceId}:`, err);
      }
    }
    setTodayLocations(totalTodayLocations);
  };

  // Modal handlers
  const openRegisterModal = () => {
    setModalType('register');
    setModalOpen(true);
  };

  const openHistoryModal = () => {
    setModalType('history');
    setModalOpen(true);
  };

  const handleDeviceRegistered = () => {
    // Refresh devices after registration
    handleRefresh();
  };

  // Calculate stats from store data
  const onlineDevices = devices.filter(device => device.isOnline).length;
  
  const stats = [
    {
      title: "Total Devices",
      value: devices.length.toString(),
      icon: Smartphone,
      change: `${devices.length} registered`,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Online Now",
      value: onlineDevices.toString(),
      icon: Activity,
      change: onlineDevices > 0 ? "Currently tracking" : "No active tracking",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Locations Today",
      value: todayLocations.toString(),
      icon: MapPin,
      change: "Data points collected",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  if (isLoading && devices.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Dashboard Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      {/* Floating particles */}
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

      <div className="relative z-10 space-y-8 p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 text-lg">Monitor your devices and tracking activity</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              System Active
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Devices Section */}
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
                  Your Devices
                  <Badge className="ml-auto bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {onlineDevices} Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices.length === 0 ? (
                  <div className="text-center py-12">
                    <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl mb-2">No devices registered</p>
                    <p className="text-gray-500">Add your first device to start tracking</p>
                  </div>
                ) : (
                  devices.map((device, index) => (
                    <motion.div
                      key={device.deviceId}
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
                              {device.updatedAt ? new Date(device.updatedAt).toLocaleString() : 'Never'}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {device.location?.coordinates 
                                ? `${device.location.coordinates[1].toFixed(4)}, ${device.location.coordinates[0].toFixed(4)}` 
                                : "No location"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            device.isOnline
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              device.isOnline ? "bg-green-400 animate-pulse" : "bg-gray-400"
                            }`}
                          />
                          {device.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={openRegisterModal}
                    className="w-full p-4 h-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-semibold">Register New Device</div>
                        <div className="text-sm opacity-90">Add a device to track</div>
                      </div>
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={openHistoryModal}
                    variant="outline"
                    className="w-full p-4 h-auto border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-semibold">View Location History</div>
                        <div className="text-sm text-gray-400">See past locations</div>
                      </div>
                      <MapPin className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    </div>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Modal */}
      <DashboardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onDeviceRegistered={handleDeviceRegistered}
      />
    </div>
  );
}