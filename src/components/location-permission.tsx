import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Shield, CheckCircle } from 'lucide-react';

interface LocationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  showStatus?: boolean;
}

export function LocationPermission({ 
  onPermissionGranted, 
  onPermissionDenied, 
  showStatus = true 
}: LocationPermissionProps) {
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCurrentPermission();
  }, []);

  const checkCurrentPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionState(permission.state);
        });
      } catch (error) {
        console.warn("Could not check geolocation permission:", error);
        // Fallback: try to get location to determine permission
        navigator.geolocation.getCurrentPosition(
          () => setPermissionState('granted'),
          () => setPermissionState('denied'),
          { timeout: 5000 }
        );
      }
    }
  };

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsRequesting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted');
        setIsRequesting(false);
        onPermissionGranted?.();
        console.log("Location permission granted:", position);
      },
      (error) => {
        setIsRequesting(false);
        let errorMessage = "Location access denied";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            setPermissionState('denied');
            onPermissionDenied?.();
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setError(errorMessage);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  if (!showStatus && permissionState === 'granted') {
    return null;
  }

  const getStatusColor = () => {
    switch (permissionState) {
      case 'granted': return 'text-green-400';
      case 'denied': return 'text-red-400';
      case 'prompt': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (permissionState) {
      case 'granted': return CheckCircle;
      case 'denied': return AlertCircle;
      case 'prompt': return Navigation;
      default: return Shield;
    }
  };

  const getStatusText = () => {
    switch (permissionState) {
      case 'granted': return 'Location access granted';
      case 'denied': return 'Location access denied';
      case 'prompt': return 'Location permission required';
      default: return 'Checking location permission...';
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${permissionState === 'granted' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
            <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
          </div>
          <div>
            <h3 className="text-white font-medium">{getStatusText()}</h3>
            <p className="text-gray-400 text-sm">
              {permissionState === 'granted' 
                ? 'Your location is being tracked'
                : 'Location access is needed for tracking'
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {(permissionState === 'prompt' || permissionState === 'denied' || error) && (
        <div className="space-y-3">
          <button
            onClick={requestPermission}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Requesting Permission...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                {permissionState === 'denied' ? 'Try Again' : 'Enable Location'}
              </>
            )}
          </button>
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Location data is used to track device movement</p>
            <p>• Your privacy is protected and data stays secure</p>
            <p>• You can disable tracking at any time</p>
          </div>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>Tip:</strong> If you previously denied location access, you may need to manually enable it in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}