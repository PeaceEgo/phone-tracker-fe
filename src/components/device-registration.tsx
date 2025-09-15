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

      <div className="relative z-10 space-y-8 p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-3">
            Device Registration
          </h1>
          <p className="text-gray-400 text-lg">Register and track devices directly</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <DirectRegistration onDeviceRegistered={() => fetchDevices(true)} />
            </motion.div>
          </div>
        </div>

        {/* Registered Devices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-400" />
                </div>
                Registered Devices
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {devices.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading devices...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No devices registered yet</p>
                  <p className="text-sm">Register your first device using the form above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device, index) => (
                    <motion.div
                      key={device.deviceId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                        <div>
                          <p className="font-semibold text-white">{device.name}</p>
                          <p className="text-xs text-gray-400">
                            Registered: {formatDate(device.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDelete(device.deviceId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
