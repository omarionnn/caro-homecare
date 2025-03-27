import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  clockIn, 
  clockOut, 
  setActiveVisit, 
  clearActiveVisit,
  VisitLocation
} from '../../redux/slices/visitSlice';
import { ROUTES, VISIT_STATUS } from '../../constants/appConstants';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LocationPicker from '../../components/LocationPicker';
import TextField from '../../components/TextField';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { locationService } from '../../services/locationService';

interface EVVScreenProps {
  navigation: any;
  route: {
    params: {
      visitId: string;
      mode: 'clockIn' | 'clockOut';
    };
  };
}

const EVVScreen: React.FC<EVVScreenProps> = ({ navigation, route }) => {
  const { visitId, mode } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const visit = useSelector((state: RootState) => 
    state.visits.entities[visitId]
  );
  const loading = useSelector((state: RootState) => state.visits.loading);
  const isOnline = useSelector((state: RootState) => state.offline.isOnline);

  const [location, setLocation] = useState<VisitLocation | null>(null);
  const [notes, setNotes] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationVerified, setIsLocationVerified] = useState(false);

  // Get the patient's location coordinates from the visit data
  const patientLocation = visit?.patientId ? {
    latitude: 37.7749, // Placeholder - this would come from the patient data
    longitude: -122.4194, // Placeholder - this would come from the patient data
  } : null;

  // Required accuracy (how close to the patient's location the caregiver needs to be)
  // This would be configurable in a real app
  const REQUIRED_LOCATION_ACCURACY_METERS = 50;
  const REQUIRED_PROXIMITY_METERS = 1000; // 1 km distance allowed from patient's location

  useEffect(() => {
    // Verify if we have a visit and it's in the correct state for the action
    if (!visit) {
      Alert.alert('Error', 'Visit not found');
      navigation.goBack();
      return;
    }

    if (mode === 'clockIn' && visit.status !== VISIT_STATUS.SCHEDULED) {
      Alert.alert('Cannot Clock In', 'This visit is not in scheduled status');
      navigation.goBack();
    } else if (mode === 'clockOut' && visit.status !== VISIT_STATUS.IN_PROGRESS) {
      Alert.alert('Cannot Clock Out', 'This visit is not in progress');
      navigation.goBack();
    }
  }, [visit, mode]);

  // Verify if the location is close enough to the patient's location
  useEffect(() => {
    if (location && patientLocation) {
      try {
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          patientLocation.latitude,
          patientLocation.longitude
        );

        const isWithinRange = distance <= REQUIRED_PROXIMITY_METERS;
        setIsLocationVerified(isWithinRange);

        if (!isWithinRange) {
          setLocationError(
            `You seem to be too far from the patient's location (${Math.round(distance)}m away). 
            You need to be within ${REQUIRED_PROXIMITY_METERS}m.`
          );
        } else {
          setLocationError(null);
        }
      } catch (error) {
        console.error('Error verifying location:', error);
        setLocationError('Error verifying your location. Please try again.');
      }
    }
  }, [location, patientLocation]);

  const handleLocationSelected = (selectedLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }) => {
    setLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      accuracy: selectedLocation.accuracy,
      timestamp: Date.now(),
    });
  };

  const handleClockIn = async () => {
    if (!location) {
      Alert.alert('Error', 'Please capture your location first');
      return;
    }

    try {
      await dispatch(clockIn({ visitId, location })).unwrap();
      dispatch(setActiveVisit(visitId));
      Alert.alert(
        'Success', 
        'You have successfully clocked in for this visit',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate(ROUTES.VISITS.VISIT_DETAILS, { visitId }) 
          }
        ]
      );
    } catch (error: any) {
      console.error('Clock in error:', error);
      Alert.alert('Clock In Failed', error.message || 'Please try again');
    }
  };

  const handleClockOut = async () => {
    if (!location) {
      Alert.alert('Error', 'Please capture your location first');
      return;
    }

    try {
      await dispatch(clockOut({ visitId, location })).unwrap();
      dispatch(clearActiveVisit());
      Alert.alert(
        'Success', 
        'You have successfully clocked out from this visit',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate(ROUTES.VISITS.DOCUMENTATION, { visitId }) 
          }
        ]
      );
    } catch (error: any) {
      console.error('Clock out error:', error);
      Alert.alert('Clock Out Failed', error.message || 'Please try again');
    }
  };

  if (!visit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading visit information...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined" style={styles.visitInfoCard}>
          <Text style={styles.visitInfoTitle}>
            {mode === 'clockIn' ? 'Clock In' : 'Clock Out'} for Visit
          </Text>
          <Text style={styles.patientName}>{visit.patientId}</Text>
          <Text style={styles.visitDate}>{formatDate(new Date(visit.scheduledStartTime))}</Text>
          <Text style={styles.visitTime}>
            {formatTime(visit.scheduledStartTime)} - {formatTime(visit.scheduledEndTime)}
          </Text>
        </Card>

        <Card variant="outlined" style={styles.locationCard}>
          <Text style={styles.locationTitle}>Verify Your Location</Text>
          <Text style={styles.locationInstructions}>
            Please confirm your location to {mode === 'clockIn' ? 'start' : 'end'} the visit.
            {!isOnline && ' Your location will be stored offline and synchronized later.'}
          </Text>

          <LocationPicker
            onLocationSelected={handleLocationSelected}
            requiredAccuracy={REQUIRED_LOCATION_ACCURACY_METERS}
            error={locationError || undefined}
          />
          
          {isLocationVerified && (
            <View style={styles.verifiedContainer}>
              <Text style={styles.verifiedText}>✓ Location verified</Text>
            </View>
          )}
        </Card>

        {mode === 'clockOut' && (
          <Card variant="outlined" style={styles.notesCard}>
            <Text style={styles.notesTitle}>Visit Notes</Text>
            <TextField
              label="Notes about this visit (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any notes about this visit"
              multiline
              numberOfLines={4}
              fullWidth
            />
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
          <Button
            title={mode === 'clockIn' ? 'Clock In' : 'Clock Out'}
            onPress={mode === 'clockIn' ? handleClockIn : handleClockOut}
            variant="primary"
            size="large"
            isLoading={loading}
            disabled={loading || !location || !!locationError}
            style={styles.actionButton}
          />
        </View>

        {!isOnline && (
          <View style={styles.offlineWarning}>
            <Text style={styles.offlineWarningText}>
              You are currently offline. Your {mode === 'clockIn' ? 'clock in' : 'clock out'} will be saved locally and synchronized when you're back online.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  visitInfoCard: {
    marginBottom: 16,
  },
  visitInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  visitTime: {
    fontSize: 16,
    color: '#666',
  },
  locationCard: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  verifiedContainer: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    flex: 1,
    marginLeft: 8,
  },
  offlineWarning: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineWarningText: {
    color: '#FF9800',
    fontSize: 14,
  },
});

export default EVVScreen;