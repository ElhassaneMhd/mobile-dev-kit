import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

/**
 * Global Location Tracking Service
 * 
 * This service provides app-wide location tracking to avoid delays when opening the scanner.
 * Location tracking starts once when the app loads (in _layout.tsx) and continues in the background.
 * 
 * Benefits:
 * - Scanner has location ready immediately (no waiting)
 * - Continuous GPS updates improve accuracy
 * - Single location service for entire app
 * 
 * Usage:
 * - Call startGlobalLocationTracking() once at app startup (done in _layout.tsx)
 * - Use useLocationTracking() hook in components that need location
 */

interface LocationData {
  location: Location.LocationObject | null;
  accuracy: number | null;
  permission: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
}

let globalLocation: Location.LocationObject | null = null;
let globalAccuracy: number | null = null;
let globalPermission: Location.PermissionStatus | null = null;
let watchSubscription: Location.LocationSubscription | null = null;
let listeners: Set<(data: LocationData) => void> = new Set();

// Start location tracking globally (call once at app startup)
export const startGlobalLocationTracking = async (showAlert: boolean = false) => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    globalPermission = status;

    if (status !== Location.PermissionStatus.GRANTED) {
      console.warn('Location permission not granted');
      
      // Show alert only if requested (e.g., when user tries to access scanner)
      if (showAlert) {
        Alert.alert(
          'Permission requise',
          'Vous devez autoriser l\'accès à la localisation pour utiliser cette fonctionnalité. Voulez-vous ouvrir les paramètres ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Ouvrir les paramètres', 
              onPress: () => Linking.openSettings()
            }
          ]
        );
      }
      
      notifyListeners();
      return;
    }

    // Get initial location
    const initialLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    globalLocation = initialLocation;
    globalAccuracy = initialLocation.coords.accuracy;
    notifyListeners();

    // Start continuous tracking
    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or when moved 10 meters
      },
      (newLocation) => {
        globalLocation = newLocation;
        globalAccuracy = newLocation.coords.accuracy;
        notifyListeners();
      }
    );

    console.log('✅ Global location tracking started');
  } catch (error) {
    console.error('Error starting global location tracking:', error);
    notifyListeners();
  }
};

// Stop location tracking (cleanup)
export const stopGlobalLocationTracking = () => {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
  console.log('🛑 Global location tracking stopped');
};

// Notify all listeners of location updates
const notifyListeners = () => {
  const data: LocationData = {
    location: globalLocation,
    accuracy: globalAccuracy,
    permission: globalPermission,
    isLoading: globalPermission === Location.PermissionStatus.GRANTED && !globalLocation,
    error: globalPermission !== Location.PermissionStatus.GRANTED ? 'Location permission denied' : null,
  };
  listeners.forEach(listener => listener(data));
};

/**
 * Hook to access global location data
 * Location tracking should be started once at app startup using startGlobalLocationTracking()
 */
export const useLocationTracking = (): LocationData => {
  const [locationData, setLocationData] = useState<LocationData>({
    location: globalLocation,
    accuracy: globalAccuracy,
    permission: globalPermission,
    isLoading: globalPermission === Location.PermissionStatus.GRANTED && !globalLocation,
    error: globalPermission !== Location.PermissionStatus.GRANTED ? 'Location permission denied' : null,
  });

  useEffect(() => {
    // Subscribe to location updates
    const listener = (data: LocationData) => {
      setLocationData(data);
    };
    listeners.add(listener);

    // If location tracking hasn't started yet, start it
    if (globalPermission === null) {
      startGlobalLocationTracking();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return locationData;
};
