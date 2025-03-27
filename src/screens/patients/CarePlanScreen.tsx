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
import { fetchPatientById } from '../../redux/slices/patientSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDate } from '../../utils/dateUtils';

interface CarePlanScreenProps {
  navigation: any;
  route: {
    params: {
      patientId: string;
    };
  };
}

const CarePlanScreen: React.FC<CarePlanScreenProps> = ({ navigation, route }) => {
  const { patientId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const patient = useSelector(
    (state: RootState) => state.patients.entities[patientId]
  );
  const loading = useSelector((state: RootState) => state.patients.loading);
  const error = useSelector((state: RootState) => state.patients.error);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      await dispatch(fetchPatientById(patientId));
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (loading && !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading care plan...</Text>
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

  if (!patient || !patient.carePlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Care plan not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const { carePlan } = patient;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.patientName}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text style={styles.planUpdated}>
          Care Plan Last Updated: {formatDate(new Date(carePlan.lastUpdated))}
        </Text>
      </View>

      <Card variant="outlined" style={styles.carePlanCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('goals')}
        >
          <Text style={styles.sectionTitle}>Care Goals</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'goals' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'goals' && (
          <View style={styles.sectionContent}>
            {carePlan.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalNumber}>{index + 1}</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card variant="outlined" style={styles.carePlanCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('instructions')}
        >
          <Text style={styles.sectionTitle}>Care Instructions</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'instructions' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'instructions' && (
          <View style={styles.sectionContent}>
            <Text style={styles.instructionsText}>{carePlan.instructions}</Text>
          </View>
        )}
      </Card>

      {carePlan.specialNotes && (
        <Card variant="outlined" style={styles.carePlanCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('notes')}
          >
            <Text style={styles.sectionTitle}>Special Notes</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'notes' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSection === 'notes' && (
            <View style={styles.sectionContent}>
              <Text style={styles.specialNotesText}>{carePlan.specialNotes}</Text>
            </View>
          )}
        </Card>
      )}

      <Card variant="outlined" style={styles.carePlanCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('medications')}
        >
          <Text style={styles.sectionTitle}>Medications</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'medications' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'medications' && (
          <View style={styles.sectionContent}>
            {patient.medications && patient.medications.length > 0 ? (
              patient.medications.map((medication) => (
                <View key={medication.id} style={styles.medicationItem}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDetails}>
                    {medication.dosage} - {medication.frequency}
                  </Text>
                  {medication.instructions && (
                    <Text style={styles.medicationInstructions}>
                      {medication.instructions}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No medications listed</Text>
            )}
          </View>
        )}
      </Card>

      <Card variant="outlined" style={styles.carePlanCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('allergies')}
        >
          <Text style={styles.sectionTitle}>Allergies</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'allergies' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'allergies' && (
          <View style={styles.sectionContent}>
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((allergy) => (
                <View key={allergy.id} style={styles.allergyItem}>
                  <View style={styles.allergyHeader}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    <View
                      style={[
                        styles.severityBadge,
                        allergy.severity === 'severe'
                          ? styles.severeSeverity
                          : allergy.severity === 'moderate'
                          ? styles.moderateSeverity
                          : styles.mildSeverity,
                      ]}
                    >
                      <Text style={styles.severityText}>{allergy.severity}</Text>
                    </View>
                  </View>
                  {allergy.reaction && (
                    <Text style={styles.allergyReaction}>
                      Reaction: {allergy.reaction}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No allergies listed</Text>
            )}
          </View>
        )}
      </Card>

      <Card variant="outlined" style={styles.carePlanCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('conditions')}
        >
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'conditions' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {expandedSection === 'conditions' && (
          <View style={styles.sectionContent}>
            {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
              patient.medicalConditions.map((condition) => (
                <View key={condition.id} style={styles.conditionItem}>
                  <Text style={styles.conditionName}>{condition.name}</Text>
                  {condition.diagnosisDate && (
                    <Text style={styles.conditionDate}>
                      Diagnosed: {formatDate(new Date(condition.diagnosisDate))}
                    </Text>
                  )}
                  {condition.description && (
                    <Text style={styles.conditionDescription}>
                      {condition.description}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No medical conditions listed</Text>
            )}
          </View>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Print Care Plan"
          onPress={() => {
            // Implement print functionality
            alert('Print functionality will be implemented soon');
          }}
          variant="outline"
          size="medium"
          style={styles.actionButton}
        />
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
  planUpdated: {
    fontSize: 14,
    color: '#666',
  },
  carePlanCard: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F51B5',
  },
  expandIcon: {
    fontSize: 16,
    color: '#3F51B5',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  goalItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  goalNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  specialNotesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  medicationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicationInstructions: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  allergyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  allergyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severeSeverity: {
    backgroundColor: '#FFEBEE',
  },
  moderateSeverity: {
    backgroundColor: '#FFF8E1',
  },
  mildSeverity: {
    backgroundColor: '#E8F5E9',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  allergyReaction: {
    fontSize: 14,
    color: '#333',
  },
  conditionItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conditionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
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

export default CarePlanScreen;