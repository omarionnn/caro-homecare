import React, { useState, useEffect } from 'react';
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
import { fetchVisitById, addVisitDocument, Visit } from '../../redux/slices/visitSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ROUTES, DOCUMENTATION_TYPES } from '../../constants/appConstants';
import { formatDate, formatTime } from '../../utils/dateUtils';

// Import documentation form components
import TextDocumentationForm from './components/TextDocumentationForm';
import ImageDocumentationForm from './components/ImageDocumentationForm';
import AudioDocumentationForm from './components/AudioDocumentationForm';
import FormDocumentationForm from './components/FormDocumentationForm';
import SignatureDocumentationForm from './components/SignatureDocumentationForm';
import DocumentationList from './components/DocumentationList';

interface DocumentationScreenProps {
  navigation: any;
  route: {
    params: {
      visitId: string;
    };
  };
}

type DocumentationType = 'text' | 'image' | 'audio' | 'form' | 'signature' | 'list';

const DocumentationScreen: React.FC<DocumentationScreenProps> = ({
  navigation,
  route,
}) => {
  const { visitId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const visit = useSelector((state: RootState) => 
    state.visits.entities[visitId]
  );
  const patient = useSelector((state: RootState) => 
    visit ? state.patients.entities[visit.patientId] : null
  );
  const loading = useSelector((state: RootState) => state.visits.loading);

  const [selectedType, setSelectedType] = useState<DocumentationType>('list');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadVisitData();
  }, [visitId]);

  const loadVisitData = async () => {
    try {
      await dispatch(fetchVisitById(visitId));
    } catch (error) {
      console.error('Error loading visit data:', error);
    }
  };

  const handleAddDocument = async (documentData: { type: string; content: string }) => {
    try {
      const document = {
        ...documentData,
        createdAt: Date.now(),
      };

      await dispatch(addVisitDocument({ visitId, document }));
      setSelectedType('list');
      Alert.alert('Success', 'Documentation added successfully');
    } catch (error) {
      console.error('Error adding documentation:', error);
      Alert.alert('Error', 'Failed to add documentation. Please try again.');
    }
  };

  const handleCompleteVisit = () => {
    // Check if we have the minimum required documentation
    const hasSignature = visit?.documents?.some(doc => doc.type === DOCUMENTATION_TYPES.SIGNATURE);
    
    if (!hasSignature) {
      Alert.alert(
        'Missing Documentation',
        'Please add a signature before completing the visit.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsCompleting(true);
    
    // Simulate API call to complete visit
    setTimeout(() => {
      setIsCompleting(false);
      Alert.alert(
        'Visit Completed',
        'The visit has been successfully completed and documentation submitted.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(ROUTES.MAIN.VISITS),
          },
        ]
      );
    }, 1000);
  };

  const renderDocumentationForm = () => {
    switch (selectedType) {
      case 'text':
        return (
          <TextDocumentationForm
            onSubmit={handleAddDocument}
            onCancel={() => setSelectedType('list')}
          />
        );
      case 'image':
        return (
          <ImageDocumentationForm
            onSubmit={handleAddDocument}
            onCancel={() => setSelectedType('list')}
          />
        );
      case 'audio':
        return (
          <AudioDocumentationForm
            onSubmit={handleAddDocument}
            onCancel={() => setSelectedType('list')}
          />
        );
      case 'form':
        return (
          <FormDocumentationForm
            onSubmit={handleAddDocument}
            onCancel={() => setSelectedType('list')}
            patientId={visit?.patientId}
          />
        );
      case 'signature':
        return (
          <SignatureDocumentationForm
            onSubmit={handleAddDocument}
            onCancel={() => setSelectedType('list')}
            visitId={visitId}
            patientName={`${patient?.firstName} ${patient?.lastName}`}
          />
        );
      case 'list':
      default:
        return (
          <DocumentationList
            visitId={visitId}
            documents={visit?.documents || []}
            onSelectDocumentType={(type: DocumentationType) => setSelectedType(type)}
          />
        );
    }
  };

  if (loading && !visit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading visit information...</Text>
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined" style={styles.visitInfoCard}>
          <Text style={styles.patientName}>{visit.patientId}</Text>
          <Text style={styles.visitDate}>{formatDate(new Date(visit.scheduledStartTime))}</Text>
          <Text style={styles.visitTime}>
            {formatTime(visit.scheduledStartTime)} - {formatTime(visit.scheduledEndTime)}
          </Text>
        </Card>

        {renderDocumentationForm()}

        {selectedType === 'list' && (
          <Button
            title="Complete Visit"
            onPress={handleCompleteVisit}
            variant="primary"
            size="large"
            isLoading={isCompleting}
            disabled={isCompleting || !visit.documents || visit.documents.length === 0}
            style={styles.completeButton}
          />
        )}
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
    paddingBottom: 24,
  },
  visitInfoCard: {
    marginBottom: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  visitTime: {
    fontSize: 14,
    color: '#666',
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
  completeButton: {
    marginTop: 24,
  },
});

export default DocumentationScreen;