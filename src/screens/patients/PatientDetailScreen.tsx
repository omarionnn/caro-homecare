import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPatientById } from '../../redux/slices/patientSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ROUTES } from '../../constants/appConstants';
import { formatDate } from '../../utils/dateUtils';

interface PatientDetailScreenProps {
  navigation: any;
  route: {
    params: {
      patientId: string;
    };
  };
}

const PatientDetailScreen: React.FC<PatientDetailScreenProps> = ({
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

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      await dispatch(fetchPatientById(patientId));
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Format: (123) 456-7890
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  };

  const handleCallPatient = async () => {
    if (!patient) return;
    
    try {
      await Linking.openURL(`tel:${patient.phone}`);
    } catch (error) {
      Alert.alert('Error', 'Could not initiate the call');
    }
  };

  const handleEmailPatient = async () => {
    if (!patient || !patient.email) return;
    
    try {
      await Linking.openURL(`mailto:${patient.email}`);
    } catch (error) {
      Alert.alert('Error', 'Could not open email client');
    }
  };

  const handleOpenMaps = async () => {
    if (!patient) return;
    
    const { address } = patient;
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    
    try {
      const url = `https://maps.apple.com/?q=${encodeURIComponent(addressString)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps
        const googleUrl = `https://maps.google.com/?q=${encodeURIComponent(addressString)}`;
        await Linking.openURL(googleUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open maps application');
    }
  };

  const handleAddNotes = () => {
    // Navigate to notes screen (to be implemented)
    Alert.alert('Info', 'Notes feature will be implemented soon');
  };

  const renderTabContent = () => {
    if (!patient) return null;

    switch (activeTab) {
      case 'info':
        return (
          <>
            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Basic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name:</Text>
                <Text style={styles.infoValue}>
                  {patient.firstName} {patient.lastName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(new Date(patient.dateOfBirth))} ({calculateAge(patient.dateOfBirth)} years)
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{patient.gender}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Language:</Text>
                <Text style={styles.infoValue}>{patient.preferredLanguage || 'English'}</Text>
              </View>
            </Card>

            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Contact Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{formatPhoneNumber(patient.phone)}</Text>
              </View>
              {patient.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{patient.email}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                </Text>
              </View>
              <View style={styles.contactButtonsContainer}>
                <Button
                  title="Call"
                  onPress={handleCallPatient}
                  variant="primary"
                  size="small"
                  style={styles.contactButton}
                />
                {patient.email && (
                  <Button
                    title="Email"
                    onPress={handleEmailPatient}
                    variant="outline"
                    size="small"
                    style={styles.contactButton}
                  />
                )}
                <Button
                  title="Maps"
                  onPress={handleOpenMaps}
                  variant="outline"
                  size="small"
                  style={styles.contactButton}
                />
              </View>
            </Card>

            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Emergency Contacts</Text>
              {patient.contactPersons && patient.contactPersons.length > 0 ? (
                patient.contactPersons
                  .filter(contact => contact.isEmergencyContact)
                  .map((contact, index) => (
                    <View key={contact.id} style={[
                      styles.emergencyContactContainer,
                      index < patient.contactPersons.filter(c => c.isEmergencyContact).length - 1 && styles.contactDivider
                    ]}>
                      <Text style={styles.contactName}>
                        {contact.firstName} {contact.lastName} ({contact.relationship})
                      </Text>
                      <Text style={styles.contactPhone}>{formatPhoneNumber(contact.phone)}</Text>
                      {contact.email && (
                        <Text style={styles.contactEmail}>{contact.email}</Text>
                      )}
                    </View>
                  ))
              ) : (
                <Text style={styles.emptyStateText}>No emergency contacts listed</Text>
              )}
            </Card>

            {patient.notes && (
              <Card variant="outlined" style={styles.detailCard}>
                <View style={styles.notesHeader}>
                  <Text style={styles.cardTitle}>Notes</Text>
                  <TouchableOpacity onPress={handleAddNotes}>
                    <Text style={styles.addNotes}>Add Notes</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.notesText}>{patient.notes}</Text>
              </Card>
            )}
          </>
        );

      case 'medical':
        return (
          <>
            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Medical Conditions</Text>
              {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
                patient.medicalConditions.map((condition) => (
                  <View key={condition.id} style={styles.medicalItem}>
                    <Text style={styles.medicalTitle}>{condition.name}</Text>
                    {condition.diagnosisDate && (
                      <Text style={styles.medicalDate}>
                        Diagnosed: {formatDate(new Date(condition.diagnosisDate))}
                      </Text>
                    )}
                    {condition.description && (
                      <Text style={styles.medicalDescription}>
                        {condition.description}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>No medical conditions listed</Text>
              )}
            </Card>

            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Medications</Text>
              {patient.medications && patient.medications.length > 0 ? (
                patient.medications.map((medication) => (
                  <View key={medication.id} style={styles.medicalItem}>
                    <Text style={styles.medicalTitle}>{medication.name}</Text>
                    <Text style={styles.medicationDetails}>
                      {medication.dosage} - {medication.frequency}
                    </Text>
                    {medication.instructions && (
                      <Text style={styles.medicalDescription}>
                        {medication.instructions}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>No medications listed</Text>
              )}
            </Card>

            <Card variant="outlined" style={styles.detailCard}>
              <Text style={styles.cardTitle}>Allergies</Text>
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((allergy) => (
                  <View key={allergy.id} style={styles.medicalItem}>
                    <View style={styles.allergyHeader}>
                      <Text style={styles.medicalTitle}>{allergy.name}</Text>
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
                      <Text style={styles.medicalDescription}>
                        Reaction: {allergy.reaction}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>No allergies listed</Text>
              )}
            </Card>
          </>
        );

      case 'care':
        return (
          <>
            <Card variant="outlined" style={styles.detailCard}>
              <View style={styles.carePlanHeader}>
                <Text style={styles.cardTitle}>Care Plan</Text>
                <Text style={styles.careLastUpdated}>
                  Last updated: {formatDate(new Date(patient.carePlan.lastUpdated))}
                </Text>
              </View>

              <View style={styles.careSection}>
                <Text style={styles.careSectionTitle}>Goals</Text>
                {patient.carePlan.goals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Text style={styles.goalNumber}>{index + 1}</Text>
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.careSection}>
                <Text style={styles.careSectionTitle}>Care Instructions</Text>
                <Text style={styles.careInstructions}>
                  {patient.carePlan.instructions}
                </Text>
              </View>

              {patient.carePlan.specialNotes && (
                <View style={styles.careSection}>
                  <Text style={styles.careSectionTitle}>Special Notes</Text>
                  <Text style={styles.careSpecialNotes}>
                    {patient.carePlan.specialNotes}
                  </Text>
                </View>
              )}
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  if (loading && !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading patient information...</Text>
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>
          <Text style={styles.patientAge}>
            {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info' && styles.activeTabText,
              ]}
            >
              Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
            onPress={() => setActiveTab('medical')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'medical' && styles.activeTabText,
              ]}
            >
              Medical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'care' && styles.activeTab]}
            onPress={() => setActiveTab('care')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'care' && styles.activeTabText,
              ]}
            >
              Care Plan
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
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
  patientHeader: {
    marginBottom: 16,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3F51B5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#3F51B5',
  },
  detailCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  contactButton: {
    marginRight: 8,
    flex: 1,
  },
  emergencyContactContainer: {
    marginBottom: 12,
    paddingBottom: 12,
  },
  contactDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#333',
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNotes: {
    fontSize: 14,
    color: '#3F51B5',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicalItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  medicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicalDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  careLastUpdated: {
    fontSize: 12,
    color: '#666',
  },
  careSection: {
    marginBottom: 16,
  },
  careSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  goalNumber: {
    width: 20,
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  careInstructions: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  careSpecialNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
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

export default PatientDetailScreen;