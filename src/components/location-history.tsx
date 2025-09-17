"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Calendar, Smartphone, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchWithAutoRefresh } from "@/lib/api";
import { useDeviceSocket } from "@/hooks/use-device-sockets";

interface Location {
  id: string;
  device: string;
  location: string;
  address: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  accuracy: string;
  battery: number;
  duration: string;
  activity: string;
}

interface Device {
  deviceId: string;
  name: string;
  type: string;
  location: { coordinates: [number, number] };
  locationName: string;
}

interface LocationHistoryEntry {
  _id: string;
  locationName?: string;
  location: { coordinates: [number, number] };
  recordedAt?: string;
  timestamp?: string;
  accuracy?: number;
  batteryLevel?: number;
  duration?: string;
  activity?: string;
}

export default function LocationHistory() {
  const [device, setDevice] = useState<Device | null>(null);
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

 const { } = useDeviceSocket(
  device ? [device.deviceId] : [],
  {
    enableTracking: true,
    updateInterval: 30000,
    highAccuracy: true
  }
);
  const paginationData = useMemo(() => {
    const totalItems = locationData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = locationData.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      currentItems,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [locationData, currentPage, itemsPerPage]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const devicesResponse = await fetchWithAutoRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/user-devices`
      );
      const devicesData = await devicesResponse.json();
      const devices: Device[] = devicesData.devices;

      if (devices.length === 0) {
        setError("No devices found");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const selectedDevice = devices[0];
      setDevice(selectedDevice);
      const historyResponse = await fetchWithAutoRefresh(
        `${process.env.NEXT_PUBLIC_API_URL}/locations/history/${selectedDevice.deviceId}`
      );
      const historyData = await historyResponse.json();

      const locationArray = Array.isArray(historyData) ? historyData : historyData.history || historyData.locations || [];

      // Fix: Use proper type instead of 'any'
      const history: Location[] = locationArray.map((entry: LocationHistoryEntry) => ({
        id: entry._id,
        device: selectedDevice.name,
        location: entry.locationName || "Unknown",
        address: entry.locationName || "Unknown",
        coordinates: {
          lat: entry.location.coordinates[1],
          lng: entry.location.coordinates[0],
        },
        timestamp: new Date(entry.recordedAt || entry.timestamp || Date.now()).toLocaleString(),
        accuracy: entry.accuracy ? `${entry.accuracy}m` : "Unknown",
        battery: entry.batteryLevel || 100,
        duration: entry.duration || "Unknown",
        activity: entry.activity || "Unknown",
      }));
    
      setLocationData(history);
      setError(null);
      setCurrentPage(1);
    } catch (err: unknown) {
      // Fix: Proper error type handling
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateDistanceTraveled = (locations: Location[]) => {
    if (locations.length < 2) return "0 km";
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1].coordinates;
      const curr = locations[i].coordinates;
      totalDistance += getDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }
    return `${totalDistance.toFixed(1)} km`;
  };

  // Calculate stats dynamically
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
      value: calculateDistanceTraveled(locationData),
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
  ];

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { totalPages } = paginationData;
    
    if (totalPages <= 5) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading location data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient background */}
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
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Enhanced Header with Refresh Button */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-4">
            Location History
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            Track your location data and movement patterns with detailed insights
          </p>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-6 py-3 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </motion.div>

        {/* Current Device Info */}
        {device && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Current Device
                    </p>
                    <p className="text-3xl font-bold text-white">{device.name}</p>
                    <p className="text-gray-400">Type: {device.type}</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <p className="text-gray-400">
                        Current Location: <span className="text-white font-medium">{device.locationName || "Unknown"}</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Coordinates: {device.location.coordinates[1].toFixed(6)}, {device.location.coordinates[0].toFixed(6)}
                    </p>
                    {locationData.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Last Update: {locationData[0].timestamp}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <Smartphone className="h-12 w-12 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
              <CardTitle className="text-white text-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  Location History Details
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                    {locationData.length} Total Records
                  </Badge>
                </div>
                {paginationData.totalItems > 0 && (
                  <div className="text-sm text-gray-400 font-normal">
                    Showing {paginationData.startIndex + 1} - {paginationData.endIndex} of {paginationData.totalItems}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {locationData.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-xl">No location history found</p>
                  <p className="text-gray-500">Location data will appear here once available</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden">
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
                        {paginationData.currentItems.map((location, index) => (
                          <motion.tr
                            key={location.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
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

                  {/* Pagination Controls */}
                  {paginationData.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={!paginationData.hasPrevPage}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === '...'}
                            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                              page === currentPage
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300'
                                : page === '...'
                                ? 'border-transparent text-gray-500 cursor-default'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNextPage}
                          disabled={!paginationData.hasNextPage}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}