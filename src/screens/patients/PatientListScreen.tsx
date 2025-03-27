import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPatients, Patient } from '../../redux/slices/patientSlice';
import Card from '../../components/Card';
import { ROUTES } from '../../constants/appConstants';

interface PatientListScreenProps {
  navigation: any;
}

const PatientListScreen: React.FC<PatientListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { entities: patients, loading, error } = useSelector(
    (state: RootState) => state.patients
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery]);

  const loadPatients = async () => {
    try {
      await dispatch(fetchPatients());
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const filterPatients = () => {
    const patientsArray = Object.values(patients);
    if (!searchQuery.trim()) {
      setFilteredPatients(patientsArray);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = patientsArray.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        patient.address.street.toLowerCase().includes(query) ||
        patient.address.city.toLowerCase().includes(query) ||
        patient.phone.includes(query)
      );
    });

    setFilteredPatients(filtered);
  };

  const navigateToPatientDetails = (patientId: string) => {
    navigation.navigate(ROUTES.PATIENTS.PATIENT_DETAILS, { patientId });
  };

  const renderPatientItem = ({ item }: { item: Patient }) => {
    return (
      <TouchableOpacity
        onPress={() => navigateToPatientDetails(item.id)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.patientCard}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.patientDetails}>
              {item.gender}, {calculateAge(item.dateOfBirth)} years
            </Text>
            <Text style={styles.patientAddress}>
              {item.address.street}, {item.address.city}, {item.address.state} {item.address.zipCode}
            </Text>
            <Text style={styles.patientPhone}>{formatPhoneNumber(item.phone)}</Text>
          </View>
          {item.carePlan && (
            <View style={styles.carePlanBadge}>
              <Text style={styles.carePlanText}>Care Plan</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        {searchQuery
          ? 'No patients match your search criteria'
          : 'No patients found. Pull down to refresh.'}
      </Text>
    </View>
  );

  // Helper functions
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

  if (loading && !refreshing && Object.keys(patients).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, address, or phone"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPatients}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  patientCard: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  patientAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: 14,
    color: '#666666',
  },
  carePlanBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  carePlanText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default PatientListScreen;