import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { locationService } from '../services/locationService';
import Button from './Button';

interface LocationPickerProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  requiredAccuracy?: number; // Required accuracy in meters
  label?: string;
  error?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelected,
  initialLocation,
  requiredAccuracy = 50, // Default to 50 meters accuracy
  label = 'Current Location',
  error,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(initialLocation || null);
  
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const getLocationHandler = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      const hasPermission = await locationService.requestLocationPermission();
      
      if (!hasPermission) {
        setPermissionDenied(true);
        setLocationError('Location permission denied. Please enable location services in your device settings.');
        setLoading(false);
        return;
      }

      const currentPosition = await locationService.getCurrentPosition();
      
      if (!currentPosition) {
        setLocationError('Unable to get your current location. Please try again.');
        setLoading(false);
        return;
      }

      const { coords } = currentPosition;
      
      // Check if accuracy meets requirements
      if (coords.accuracy && coords.accuracy > requiredAccuracy) {
        setLocationError(`Low location accuracy (${Math.round(coords.accuracy)}m). Please try again in a more open area.`);
      } else {
        setLocationError(null);
      }

      const newLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      };

      setLocation(newLocation);
      onLocationSelected(newLocation);
    } catch (err) {
      setLocationError('Error getting location. Please try again.');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            />
          </MapView>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              {permissionDenied
                ? 'Location access denied'
                : 'No location selected'}
            </Text>
          </View>
        )}
      </View>

      {(location?.accuracy && requiredAccuracy) && (
        <Text style={styles.accuracyText}>
          Accuracy: {Math.round(location.accuracy)}m
          {location.accuracy > requiredAccuracy && ' (Low accuracy)'}
        </Text>
      )}

      <Button
        title={loading ? 'Getting Location...' : 'Get Current Location'}
        onPress={getLocationHandler}
        isLoading={loading}
        disabled={loading}
        fullWidth
        variant="primary"
        size="medium"
      />

      {(locationError || error) && (
        <Text style={styles.errorText}>{locationError || error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  mapContainer: {
    height: 200,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});

export default LocationPicker;
