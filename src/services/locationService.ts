import Geolocation, { GeoPosition, GeoError } from '@react-native-community/geolocation';
import { LOCATION } from '../constants/appConstants';
import { Platform, PermissionsAndroid } from 'react-native';

type LocationCallback = (position: GeoPosition | null, error?: GeoError) => void;

interface LocationServiceOptions {
  highAccuracy?: boolean;
  distanceFilter?: number;
  timeout?: number;
  maximumAge?: number;
}

class LocationService {
  private watchId: number | null = null;
  private lastKnownPosition: GeoPosition | null = null;
  private locationListeners: Set<LocationCallback> = new Set();

  constructor() {
    // Configure geolocation
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });
  }

  /**
   * Request location permissions
   * @returns Promise resolving to a boolean indicating if permission was granted
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS handled by the Geolocation module
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for visit verification.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting location permission:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Get the current position
   * @param options Location options
   * @returns Promise resolving to a position or null
   */
  async getCurrentPosition(options: LocationServiceOptions = {}): Promise<GeoPosition | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) return null;

    try {
      return await new Promise<GeoPosition>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            this.lastKnownPosition = position;
            resolve(position);
          },
          (error) => reject(error),
          {
            enableHighAccuracy: options.highAccuracy ?? LOCATION.HIGH_ACCURACY,
            timeout: options.timeout ?? LOCATION.TIMEOUT,
            maximumAge: options.maximumAge ?? LOCATION.MAXIMUM_AGE,
          },
        );
      });
    } catch (error) {
      console.error('Error getting current position:', error);
      return this.lastKnownPosition; // Return last known position as fallback
    }
  }

  /**
   * Start watching position updates
   * @param options Location options
   * @returns The watch ID
   */
  startWatchingPosition(options: LocationServiceOptions = {}): number | null {
    if (this.watchId !== null) {
      // Already watching, return existing watchId
      return this.watchId;
    }

    this.requestLocationPermission().then((hasPermission) => {
      if (!hasPermission) return;

      this.watchId = Geolocation.watchPosition(
        (position) => {
          this.lastKnownPosition = position;
          this.notifyListeners(position);
        },
        (error) => {
          console.error('Error watching position:', error);
          this.notifyListeners(null, error);
        },
        {
          enableHighAccuracy: options.highAccuracy ?? LOCATION.HIGH_ACCURACY,
          distanceFilter: options.distanceFilter ?? LOCATION.DISTANCE_FILTER,
          interval: LOCATION.TIMEOUT, // Android only
          fastestInterval: LOCATION.TIMEOUT / 2, // Android only
        },
      );
    }).catch(error => {
      console.error('Error requesting location permission:', error);
    });

    return this.watchId;
  }

  /**
   * Stop watching position updates
   */
  stopWatchingPosition(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Add a location update listener
   * @param callback Callback function for location updates
   */
  addLocationListener(callback: LocationCallback): void {
    this.locationListeners.add(callback);
    
    // If we already have a position, notify immediately
    if (this.lastKnownPosition) {
      callback(this.lastKnownPosition);
    }
  }

  /**
   * Remove a location update listener
   * @param callback Callback function to remove
   */
  removeLocationListener(callback: LocationCallback): void {
    this.locationListeners.delete(callback);
  }

  /**
   * Notify all registered listeners of a location update
   * @param position The new position or null
   * @param error Optional error object
   */
  private notifyListeners(position: GeoPosition | null, error?: GeoError): void {
    this.locationListeners.forEach(listener => {
      listener(position, error);
    });
  }

  /**
   * Calculate distance between two coordinates in meters
   * @param lat1 First latitude
   * @param lon1 First longitude
   * @param lat2 Second latitude
   * @param lon2 Second longitude
   * @returns Distance in meters
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if a location is within a specified radius of a target
   * @param currentLat Current latitude
   * @param currentLon Current longitude
   * @param targetLat Target latitude
   * @param targetLon Target longitude
   * @param radiusMeters Allowed radius in meters
   * @returns Whether the current location is within the radius
   */
  isWithinRadius(
    currentLat: number,
    currentLon: number,
    targetLat: number,
    targetLon: number,
    radiusMeters: number,
  ): boolean {
    const distance = this.calculateDistance(
      currentLat,
      currentLon,
      targetLat,
      targetLon,
    );
    return distance <= radiusMeters;
  }

  /**
   * Get the last known position
   * @returns The last known position or null
   */
  getLastKnownPosition(): GeoPosition | null {
    return this.lastKnownPosition;
  }
}

export const locationService = new LocationService();
