"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DirectRegistration } from "./direct-device-registration";
import { useEffect } from "react";
import { useDevicesStore } from "../store/devices";

export function DeviceRegistration() {
  const { devices, isLoading, fetchDevices, removeDevice } = useDevicesStore();

  useEffect(() => {
    fetchDevices(false);
  }, [fetchDevices]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDeviceIcon = (type: string) => {
    return type === "ios" ? "📱" : "🤖";
  };

  const handleDelete = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
      toast.success("Device removed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete device");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />

      <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center sm:text-left"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-2 sm:mb-3">
            Device Registration
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">Register and track devices directly</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Registration Form */}
          <div className="xl:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
            >
              <DirectRegistration onDeviceRegistered={() => fetchDevices(true)} />
            </motion.div>
          </div>
        </div>

        {/* Registered Devices */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <span>Registered Devices</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 w-fit text-xs sm:text-sm">
                  {devices.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col sm:flex-row items-center justify-center py-6 sm:py-8 gap-2 sm:gap-0">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-400" />
                  <span className="text-sm sm:text-base text-gray-400 sm:ml-2">Loading devices...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base mb-1">No devices registered yet</p>
                  <p className="text-xs sm:text-sm">Register your first device using the form above</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {devices.map((device, index) => (
                    <motion.div
                      key={device.deviceId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{getDeviceIcon(device.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white text-sm sm:text-base truncate">{device.name}</p>
                          <p className="text-xs text-gray-400">
                            Registered: {formatDate(device.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center sm:justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() => handleDelete(device.deviceId)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}