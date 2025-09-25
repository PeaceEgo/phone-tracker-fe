"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, MapPin, Activity, Plus, RefreshCw, Clock } from "lucide-react";
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
  }, [fetchDevices, devices, fetchLocationHistory, updateOnlineStatusFromHistory]);

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Dashboard Error</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">{error}</p>
          <Button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto">
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

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-2 sm:mb-3">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">Monitor your devices and tracking activity</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500 hover:text-white text-xs sm:text-sm"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Devices Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Device Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-400" />
                    Your Devices
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 w-fit">
                    {onlineDevices} Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {devices.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Smartphone className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg sm:text-xl mb-2">No devices registered</p>
                    <p className="text-gray-500 text-sm sm:text-base">Add your first device to start tracking</p>
                  </div>
                ) : (
                  devices.map((device, index) => (
                    <motion.div
                      key={device.deviceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm sm:text-base truncate">{device.name}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {device.updatedAt ? new Date(device.updatedAt).toLocaleString() : 'Never'}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {device.location?.coordinates 
                                  ? `${device.location.coordinates[1].toFixed(4)}, ${device.location.coordinates[0].toFixed(4)}` 
                                  : "No location"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center sm:justify-end">
                        <Badge
                          className={`text-xs ${
                            device.isOnline
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
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
            className="space-y-4 sm:space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={openRegisterModal}
                    className="w-full p-3 sm:p-4 h-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base">Register New Device</div>
                        <div className="text-xs sm:text-sm opacity-90">Add a device to track</div>
                      </div>
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={openHistoryModal}
                    variant="outline"
                    className="w-full p-3 sm:p-4 h-auto border-white/20 text-white hover:bg-white/10 bg-transparent transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base">View Location History</div>
                        <div className="text-xs sm:text-sm text-gray-400">See past locations</div>
                      </div>
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all flex-shrink-0" />
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