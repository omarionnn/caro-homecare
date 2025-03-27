import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPatientById, MedicalCondition } from '../../redux/slices/patientSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDate } from '../../utils/dateUtils';

interface MedicalHistoryScreenProps {
  navigation: any;
  route: {
    params: {
      patientId: string;
    };
  };
}

const MedicalHistoryScreen: React.FC<MedicalHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { patientId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const patient = useSelector(
    (state: RootState) => state.patients.entities[patientId]
  );
  const loading = useSelector((state: RootState) => state.patients.loading);
  const error = useSelector((state: RootState) => state.patients.error);

  const [sortedConditions, setSortedConditions] = useState<MedicalCondition[]>([]);
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'chronological'>('chronological');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  useEffect(() => {
    if (patient && patient.medicalConditions) {
      sortConditions();
    }
  }, [patient, sortOrder]);

  const loadPatientData = async () => {
    try {
      await dispatch(fetchPatientById(patientId));
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const sortConditions = () => {
    if (!patient || !patient.medicalConditions) return;

    const conditions = [...patient.medicalConditions];

    if (sortOrder === 'alphabetical') {
      conditions.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by diagnosis date (most recent first)
      conditions.sort((a, b) => {
        if (!a.diagnosisDate) return 1;
        if (!b.diagnosisDate) return -1;
        return new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime();
      });
    }

    setSortedConditions(conditions);
  };

  const toggleSortOrder = () => {
    setSortOrder(
      sortOrder === 'alphabetical' ? 'chronological' : 'alphabetical'
    );
  };

  if (loading && !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading medical history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={loadPatientData}
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Patient not found</Text>
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
      <View style={styles.headerContainer}>
        <Text style={styles.patientName}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text style={styles.screenTitle}>Medical History</Text>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
          <Text style={styles.sortButtonText}>
            {sortOrder === 'alphabetical' ? 'Name' : 'Date'} ↓
          </Text>
        </TouchableOpacity>
      </View>

      {sortedConditions.length === 0 ? (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text style={styles.emptyText}>No medical conditions recorded</Text>
        </Card>
      ) : (
        sortedConditions.map((condition) => (
          <Card key={condition.id} variant="outlined" style={styles.conditionCard}>
            <View style={styles.conditionHeader}>
              <Text style={styles.conditionName}>{condition.name}</Text>
              {condition.diagnosisDate && (
                <Text style={styles.diagnosisDate}>
                  Diagnosed: {formatDate(new Date(condition.diagnosisDate))}
                </Text>
              )}
            </View>

            {condition.description && (
              <Text style={styles.conditionDescription}>{condition.description}</Text>
            )}
          </Card>
        ))
      )}

      <Card variant="outlined" style={styles.relatedInfoCard}>
        <Text style={styles.relatedInfoTitle}>Related Information</Text>

        <TouchableOpacity
          style={styles.relatedInfoItem}
          onPress={() => navigation.navigate('MedicationList', { patientId })}
        >
          <Text style={styles.relatedInfoText}>Medications</Text>
          <Text style={styles.relatedInfoCount}>
            {patient.medications?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.relatedInfoItem}
          onPress={() => navigation.navigate('AllergyList', { patientId })}
        >
          <Text style={styles.relatedInfoText}>Allergies</Text>
          <Text style={styles.relatedInfoCount}>
            {patient.allergies?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.relatedInfoItem}
          onPress={() => navigation.navigate('CarePlan', { patientId })}
        >
          <Text style={styles.relatedInfoText}>Care Plan</Text>
          <Text style={styles.relatedInfoArrow}>→</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          title="Back to Patient"
          onPress={() => navigation.goBack()}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
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
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 16,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 16,
    color: '#666',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#3F51B5',
    fontWeight: '500',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  conditionCard: {
    marginBottom: 12,
  },
  conditionHeader: {
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  diagnosisDate: {
    fontSize: 14,
    color: '#666',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  relatedInfoCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  relatedInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  relatedInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  relatedInfoText: {
    fontSize: 14,
    color: '#3F51B5',
  },
  relatedInfoCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  relatedInfoArrow: {
    fontSize: 16,
    color: '#3F51B5',
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
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
});

export default MedicalHistoryScreen;