"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useDevicesStore, Device } from "@/store/devices";
import { useDeviceRegistration } from "@/hooks/use-device-registration";
import Link from "next/link";

interface LocationEntry {
  _id: string;
  locationName: string;
  location: { coordinates: [number, number] };
  timestamp: string;
  accuracy?: string;
  activity?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'register' | 'history';
  onDeviceRegistered?: () => void;
}

export function DashboardModal({ isOpen, onClose, type, onDeviceRegistered }: ModalProps) {
  // Location history state (separate from registration logic)
  const [locationHistory, setLocationHistory] = useState<LocationEntry[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Get devices and methods from store
  const { devices, fetchLocationHistory } = useDevicesStore();
  
  // Registration form state
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<'android' | 'ios'>('android');
  const [locationName, setLocationName] = useState('');

  // Use the registration hook
  const {
    isRegistering,
    isGettingLocation,
    currentLocation,
    error: registrationError,
    getCurrentLocation,
    registerDevice,
    resetError
  } = useDeviceRegistration();

  const handleRegisterDevice = async () => {
    if (!deviceName || !deviceType) {
      resetError();
      return;
    }

    try {
      await registerDevice(deviceName, deviceType, currentLocation || undefined, locationName);
      
      // Reset form
      setDeviceName('');
      setDeviceType('android');
      setLocationName('');
      
      // Notify parent component
      if (onDeviceRegistered) {
        onDeviceRegistered();
      }
      
      onClose();
    } catch (err) {
      // Error is handled by the hook
      console.error('Device registration failed:', err);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to get location:', error);
    }
  };

  const handleViewHistory = async (device: Device) => {
    try {
      setHistoryLoading(true);
      setSelectedDevice(device);
      setHistoryError(null);
      
      const data = await fetchLocationHistory(device.deviceId);
      setLocationHistory(data.history || []);
    } catch (err: unknown) {
      console.error('Error fetching location history:', err);
      setHistoryError((err as Error)?.message || 'Failed to fetch location history');
      setLocationHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const renderRegisterContent = () => (
    <div className="space-y-4 sm:space-y-6"> 
      <div className="text-center">
        <Link href="/">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl border border-blue-500/30 inline-flex mb-3 sm:mb-4">
          <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
        </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Register New Device</h2>
        <p className="text-gray-400 text-sm sm:text-base px-2">Add a new device to start tracking its location</p>
      </div>

      {registrationError && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {registrationError}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="deviceName" className="text-gray-300 mb-2 text-sm sm:text-base">Device Name *</Label>
          <Input
            id="deviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., My iPhone"
            className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
            disabled={isRegistering}
          />
        </div>

        <div>
          <Label htmlFor="deviceType" className="text-gray-300 mb-2 text-sm sm:text-base">Device Type *</Label>
          <Select 
            value={deviceType} 
            onValueChange={(value: 'android' | 'ios') => setDeviceType(value)} 
            disabled={isRegistering}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white h-10 sm:h-11">
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="android">Android</SelectItem>
              <SelectItem value="ios">IOS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="locationName" className="text-gray-300 mb-2 text-sm sm:text-base">
            Location Name 
            <span className="text-gray-500 text-xs ml-1">(optional - will auto-detect if empty)</span>
          </Label>
          <Input
            id="locationName"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g., Home, Office (optional)"
            className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
            disabled={isRegistering}
          />
        </div>

        <Button
          onClick={handleGetCurrentLocation}
          variant="outline"
          disabled={isGettingLocation || isRegistering}
          className="w-full border-blue-500/30 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 h-10 sm:h-11 text-sm sm:text-base"
        >
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
        </Button>
       
        {currentLocation && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-xs sm:text-sm font-medium">Location Captured</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div className="break-all">Latitude: {currentLocation.latitude}</div>
              <div className="break-all">Longitude: {currentLocation.longitude}</div>
              {currentLocation.accuracy && (
                <div>Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 bg-transparent border-slate-600/50 text-white hover:bg-slate-700/50 h-10 sm:h-11 text-sm sm:text-base order-2 sm:order-1"
          disabled={isRegistering}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRegisterDevice}
          disabled={isRegistering || !deviceName.trim() || !currentLocation}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 h-10 sm:h-11 text-sm sm:text-base order-1 sm:order-2"
        >
          {isRegistering ? 'Registering...' : 'Register Device'}
        </Button>
      </div>
    </div>
  );

  const renderHistoryContent = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl border border-blue-500/30 inline-flex mb-3 sm:mb-4">
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Location History</h2>
        <p className="text-gray-400 text-sm sm:text-base px-2">View past locations for your devices</p>
      </div>

      {historyError && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {historyError}
        </div>
      )}

      {!selectedDevice ? (
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">No devices registered yet</p>
              <p className="text-gray-500 text-xs sm:text-sm">Register a device first to view location history</p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-center text-sm sm:text-base px-2">Select a device to view its location history:</p>
              <div className="space-y-2 sm:space-y-3">
                {devices.map((device) => (
                  <motion.div
                    key={device.deviceId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleViewHistory(device)}
                      variant="outline"
                      disabled={historyLoading}
                      className="w-full p-3 sm:p-4 h-auto border-slate-600/50 text-white hover:bg-slate-700/50 bg-slate-800/50 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-semibold text-white text-sm sm:text-base truncate">{device.name}</div>
                            <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 sm:gap-2">
                              <Badge 
                                className={`text-xs ${device.isOnline 
                                  ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                }`}
                              >
                                {device.isOnline ? "Online" : "Offline"}
                              </Badge>
                              <span className="capitalize">{device.type}</span>
                            </div>
                          </div>
                        </div>
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{selectedDevice.name}</h3>
              <div className="flex items-center gap-2 text-gray-400">
                <Badge 
                  className={`text-xs ${selectedDevice.isOnline 
                    ? "bg-green-500/20 text-green-300 border-green-500/30" 
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {selectedDevice.isOnline ? "Online" : "Offline"}
                </Badge>
                <span className="text-xs sm:text-sm capitalize">{selectedDevice.type}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedDevice(null);
                setLocationHistory([]);
                setHistoryError(null);
              }}
              variant="outline"
              size="sm"
              className="border-slate-600/50 text-white hover:bg-slate-700/50 bg-slate-800/50 text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
              disabled={historyLoading}
            >
              Back to Devices
            </Button>
          </div>

          {historyLoading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm sm:text-base">Loading location history...</p>
            </div>
          ) : locationHistory.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">No location history found</p>
              <p className="text-gray-500 text-xs sm:text-sm">This device hasn&apos;t reported any locations yet</p>
            </div>
          ) : (
            <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto space-y-2 sm:space-y-3">
              {locationHistory.map((entry) => (
                <div
                  key={entry._id}
                  className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm sm:text-base truncate">
                          {entry.locationName || "Unknown Location"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 break-all">
                          {entry.location.coordinates[1].toFixed(6)}, {entry.location.coordinates[0].toFixed(6)}
                        </p>
                        {entry.accuracy && (
                          <p className="text-xs text-gray-500">
                            Accuracy: {entry.accuracy}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-6 sm:ml-0">
                      <p className="text-xs sm:text-sm text-gray-300">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs sm:text-sm">
              {locationHistory.length} Location {locationHistory.length === 1 ? 'Record' : 'Records'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-black/90 border border-slate-600/50 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end p-4 sm:p-6 pb-0">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 h-8 w-8 sm:h-9 sm:w-9"
                  disabled={isRegistering || historyLoading}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              {/* Scrollable content container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4">
                {type === 'register' ? renderRegisterContent() : renderHistoryContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}