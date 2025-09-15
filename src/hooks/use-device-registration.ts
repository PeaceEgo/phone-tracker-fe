
import { useState } from 'react';
import { useDevicesStore } from '@/store/devices';

const generateDeviceFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent || 'unknown',
      navigator.language || 'unknown',
      screen.width + 'x' + screen.height,
      screen.colorDepth || 0,
      new Date().getTimezoneOffset(),
      !!window.localStorage,
      !!window.sessionStorage,
      canvas.toDataURL()
    ].join('|');
  
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.warn('Failed to generate device fingerprint:', error);
    return Date.now().toString() + Math.random().toString(36);
  }
};

interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface DeviceRegistrationData {
  name: string;
  type: 'android' | 'ios';
  location: {
    latitude: number;
    longitude: number;
  };
  locationName?: string;
  deviceFingerprint: string;
  userAgent: string;
}

export const useDeviceRegistration = () => {
  const { addDevice } = useDevicesStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<GeolocationResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result: GeolocationResult = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          console.log('Geolocation success:', {
            ...result,
            timestamp: new Date(position.timestamp)
          });
          
          setCurrentLocation(result);
          setIsGettingLocation(false);
          resolve(result);
        },
        (error) => {
          console.error('Geolocation error:', error);
          
          let errorMessage = 'Failed to get current location: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out';
              break;
            default:
              errorMessage += error.message;
              break;
          }
          
          setError(errorMessage);
          setIsGettingLocation(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  const registerDevice = async (
    name: string,
    type: 'android' | 'ios',
    location?: GeolocationResult,
    locationName?: string
  ) => {
    const deviceLocation = location || currentLocation;
    
    if (!deviceLocation) {
      throw new Error('Device location is required');
    }

    if (!name.trim()) {
      throw new Error('Device name is required');
    }

    setIsRegistering(true);
    setError(null);

    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      const deviceData: DeviceRegistrationData = {
        name: name.trim(),
        type,
        location: {
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
        },
        deviceFingerprint,
        userAgent: navigator.userAgent,
        ...(locationName && { locationName })
      };

      console.log('Registering device with fingerprint:', deviceFingerprint);
      console.log('Device data:', deviceData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(deviceData)
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        throw new Error(errorData.message || 'Failed to register device');
      }

      const result = JSON.parse(responseText);
      const newDevice = result.device || result;


      addDevice({
        deviceId: newDevice.deviceId,
        name: newDevice.name,
        type: newDevice.type,
        createdAt: newDevice.createdAt || new Date().toISOString(),
        location: newDevice.location,
        qrCodeId: newDevice.qrCodeId,
        qrCodeImage: newDevice.qrCodeImage,
        registrationMethod: newDevice.registrationMethod || 'direct',
        isActive: newDevice.isActive ?? true,
        isOnline: false,
        updatedAt: newDevice.updatedAt || new Date().toISOString(),
      });

      return newDevice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  const resetLocation = () => {
    setCurrentLocation(null);
    setError(null);
  };

  const resetError = () => {
    setError(null);
  };

  return {
    // State
    isRegistering,
    isGettingLocation,
    currentLocation,
    error,
    
    // Actions
    getCurrentLocation,
    registerDevice,
    resetLocation,
    resetError,
    
    
    generateDeviceFingerprint: () => generateDeviceFingerprint()
  };
};