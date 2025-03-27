import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchVisitById } from '../../redux/slices/visitSlice';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import { ROUTES, VISIT_STATUS } from '../../constants/appConstants';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDate, formatTime, calculateDuration } from '../../utils/dateUtils';

interface VisitDetailScreenProps {
  navigation: any;
  route: {
    params: {
      visitId: string;
    };
  };
}

const VisitDetailScreen: React.FC<VisitDetailScreenProps> = ({ navigation, route }) => {
  const { visitId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const visit = useSelector((state: RootState) => 
    state.visits.entities[visitId]
  );
  const patient = useSelector((state: RootState) => 
    visit ? state.patients.entities[visit.patientId] : null
  );
  const loading = useSelector((state: RootState) => state.visits.loading);
  const error = useSelector((state: RootState) => state.visits.error);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVisitData();
  }, [visitId]);

  const loadVisitData = async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchVisitById(visitId)).unwrap();
      
      // Once we have the visit, fetch patient details if needed
      if (visit && !patient) {
        await dispatch(fetchPatientById(visit.patientId)).unwrap();
      }
    } catch (error) {
      console.error('Error loading visit details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockIn = () => {
    navigation.navigate(ROUTES.VISITS.CLOCK_IN, { visitId });
  };

  const handleClockOut = () => {
    navigation.navigate(ROUTES.VISITS.CLOCK_OUT, { visitId });
  };

  const handleAddDocumentation = () => {
    navigation.navigate(ROUTES.VISITS.DOCUMENTATION, { visitId });
  };

  const handleNavigateToPatient = () => {
    if (visit) {
      navigation.navigate(ROUTES.PATIENTS.PATIENT_DETAILS, { patientId: visit.patientId });
    }
  };

  const handleCancelVisit = () => {
    Alert.alert(
      'Cancel Visit',
      'Are you sure you want to cancel this visit?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Todo: implement cancel visit functionality
            Alert.alert('Visit Cancelled', 'This visit has been cancelled.');
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (!visit) return '#757575'; // Default gray
    
    switch (visit.status) {
      case VISIT_STATUS.SCHEDULED: return '#FF9800'; // Orange
      case VISIT_STATUS.IN_PROGRESS: return '#4CAF50'; // Green
      case VISIT_STATUS.COMPLETED: return '#2196F3'; // Blue
      case VISIT_STATUS.MISSED: return '#F44336'; // Red
      case VISIT_STATUS.CANCELLED: return '#757575'; // Gray
      default: return '#757575';
    }
  };

  const getButtonOptions = () => {
    if (!visit) return null;
    
    switch (visit.status) {
      case VISIT_STATUS.SCHEDULED:
        return (
          <Button
            title="Clock In"
            onPress={handleClockIn}
            variant="primary"
            size="large"
            fullWidth
          />
        );
      case VISIT_STATUS.IN_PROGRESS:
        return (
          <Button
            title="Clock Out"
            onPress={handleClockOut}
            variant="primary"
            size="large"
            fullWidth
          />
        );
      case VISIT_STATUS.COMPLETED:
        return (
          <Button
            title="View/Add Documentation"
            onPress={handleAddDocumentation}
            variant="outline"
            size="large"
            fullWidth
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading visit details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Retry" 
          onPress={loadVisitData} 
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Visit not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Visit Status Card */}
      <Card variant="filled" style={[styles.statusCard, { backgroundColor: `${getStatusColor()}15` }]}>
        <View style={styles.statusHeader}>
          <Text style={styles.visitTitle}>Visit Details</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{visit.status}</Text>
          </View>
        </View>
        
        <Text style={styles.patientName}>{visit.patientId}</Text>
        <Text style={styles.visitDate}>{formatDate(new Date(visit.scheduledStartTime))}</Text>
        
        <View style={styles.timeDetails}>
          <Text style={styles.timeLabel}>Scheduled Time:</Text>
          <Text style={styles.timeValue}>
            {formatTime(visit.scheduledStartTime)} - {formatTime(visit.scheduledEndTime)}
          </Text>
        </View>
        
        {visit.actualStartTime && (
          <View style={styles.timeDetails}>
            <Text style={styles.timeLabel}>Actual Clock In:</Text>
            <Text style={styles.timeValue}>{formatTime(visit.actualStartTime)}</Text>
          </View>
        )}
        
        {visit.actualEndTime && (
          <View style={styles.timeDetails}>
            <Text style={styles.timeLabel}>Actual Clock Out:</Text>
            <Text style={styles.timeValue}>{formatTime(visit.actualEndTime)}</Text>
          </View>
        )}
        
        {visit.actualStartTime && visit.actualEndTime && (
          <View style={styles.timeDetails}>
            <Text style={styles.timeLabel}>Duration:</Text>
            <Text style={styles.timeValue}>
              {calculateDuration(visit.actualStartTime, visit.actualEndTime)}
            </Text>
          </View>
        )}
      </Card>

      {/* Patient Information Card */}
      <Card variant="outlined" style={styles.patientCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <TouchableOpacity onPress={handleNavigateToPatient}>
            <Text style={styles.viewMoreText}>View Full Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{visit.patientId}</Text>
        </View>
        
        {patient && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{patient.phone}</Text>
            </View>
          </>
        )}
      </Card>

      {/* Tasks Card */}
      <Card variant="outlined" style={styles.tasksCard}>
        <Text style={styles.sectionTitle}>Visit Tasks</Text>
        
        {visit.tasks && visit.tasks.length > 0 ? (
          <View style={styles.tasksList}>
            {visit.tasks.map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <Text style={styles.taskNumber}>{index + 1}</Text>
                <Text style={styles.taskText}>{task}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noTasksText}>No tasks assigned for this visit</Text>
        )}
      </Card>

      {/* Notes Card */}
      {visit.notes && (
        <Card variant="outlined" style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{visit.notes}</Text>
        </Card>
      )}

      {/* Documentation Card */}
      <Card variant="outlined" style={styles.documentsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Documentation</Text>
          {visit.status === VISIT_STATUS.COMPLETED && (
            <TouchableOpacity onPress={handleAddDocumentation}>
              <Text style={styles.viewMoreText}>Add Documentation</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {visit.documents && visit.documents.length > 0 ? (
          visit.documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.documentType}>{doc.type}</Text>
              <Text style={styles.documentDate}>
                {formatDate(new Date(doc.createdAt))}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDocumentsText}>No documentation available</Text>
        )}
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {visit.status === VISIT_STATUS.SCHEDULED && (
          <Button
            title="Cancel Visit"
            onPress={handleCancelVisit}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
        )}
        
        {getButtonOptions()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: 200,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
    marginBottom: 8,
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  patientCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewMoreText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  tasksCard: {
    marginBottom: 16,
  },
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskNumber: {
    backgroundColor: '#E0E0E0',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    paddingTop: 2,
  },
  noTasksText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  notesCard: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  documentsCard: {
    marginBottom: 24,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  documentType: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
  },
  noDocumentsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  cancelButton: {
    marginBottom: 8,
  },
});

export default VisitDetailScreen;