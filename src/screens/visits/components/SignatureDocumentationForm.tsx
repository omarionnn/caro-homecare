import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';

interface SignatureDocumentationFormProps {
  onSubmit: (data: { type: string; content: string }) => void;
  onCancel: () => void;
  visitId: string;
  patientName?: string;
}

interface SignatureCapture {
  data: string; // In a real app, this would be the signature image data
  name: string;
  relationship: string;
  date: string;
}

const SignatureDocumentationForm: React.FC<SignatureDocumentationFormProps> = ({
  onSubmit,
  onCancel,
  visitId,
  patientName = 'Patient',
}) => {
  const [hasSignature, setHasSignature] = useState(false);
  const [signatory, setSignatory] = useState('patient');
  const [relationship, setRelationship] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  // In a real app, this would use a signature capture component like react-native-signature-canvas
  const handleCaptureSignature = () => {
    // Simulate signature capture
    Alert.alert(
      'Signature Capture',
      'In a real app, this would display a signature pad. For this demo, we\'ll simulate a captured signature.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Simulate Capture',
          onPress: () => {
            setHasSignature(true);
          },
        },
      ]
    );
  };

  const handleClearSignature = () => {
    setHasSignature(false);
  };

  const validateForm = () => {
    if (!hasSignature) {
      Alert.alert('Missing Signature', 'Please capture a signature first.');
      return false;
    }

    if (signatory === 'representative' && !relationship.trim()) {
      Alert.alert('Missing Information', 'Please specify the relationship to the patient.');
      return false;
    }

    if (!confirmationChecked) {
      Alert.alert('Confirmation Required', 'Please check the confirmation box to proceed.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const signatureData: SignatureCapture = {
      data: 'signature_placeholder_data',
      name: signatory === 'patient' ? patientName : `Representative for ${patientName}`,
      relationship: signatory === 'representative' ? relationship : 'Self',
      date: new Date().toISOString(),
    };

    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSubmit({
        type: DOCUMENTATION_TYPES.SIGNATURE,
        content: JSON.stringify(signatureData),
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card variant="outlined" style={styles.formCard}>
        <Text style={styles.formTitle}>Electronic Signature</Text>
        <Text style={styles.formSubtitle}>
          Capture an electronic signature to confirm services provided
        </Text>

        <View style={styles.signatoryContainer}>
          <Text style={styles.signatoryLabel}>Who is signing?</Text>
          <View style={styles.signatoryOptions}>
            <TouchableOpacity
              style={[
                styles.signatoryOption,
                signatory === 'patient' && styles.signatoryOptionSelected,
              ]}
              onPress={() => setSignatory('patient')}
            >
              <View style={styles.radioButton}>
                {signatory === 'patient' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.signatoryOptionText}>Patient</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.signatoryOption,
                signatory === 'representative' && styles.signatoryOptionSelected,
              ]}
              onPress={() => setSignatory('representative')}
            >
              <View style={styles.radioButton}>
                {signatory === 'representative' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.signatoryOptionText}>
                Patient Representative
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {signatory === 'representative' && (
          <View style={styles.relationshipContainer}>
            <Text style={styles.relationshipLabel}>
              Relationship to Patient
            </Text>
            <View style={styles.relationshipOptions}>
              {['Spouse', 'Child', 'Parent', 'Legal Guardian', 'Other'].map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.relationshipOption,
                    relationship === rel && styles.relationshipOptionSelected,
                  ]}
                  onPress={() => setRelationship(rel)}
                >
                  <Text style={styles.relationshipOptionText}>{rel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.signatureContainer}>
          <Text style={styles.signatureLabel}>Signature</Text>
          {hasSignature ? (
            <View style={styles.signaturePreviewContainer}>
              <View style={styles.signaturePlaceholder}>
                <Text style={styles.signaturePlaceholderText}>
                  Signature Preview
                </Text>
                <Text style={styles.signaturePlaceholderSubtext}>
                  (Actual signature capture not implemented in demo)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSignature}
              >
                <Text style={styles.clearButtonText}>Clear Signature</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCaptureSignature}
            >
              <Text style={styles.captureButtonText}>Tap to Sign</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.confirmationContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setConfirmationChecked(!confirmationChecked)}
          >
            <View style={styles.checkbox}>
              {confirmationChecked && <View style={styles.checkboxSelected} />}
            </View>
            <Text style={styles.confirmationText}>
              I confirm that the services described have been provided as documented.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalText}>
          <Text style={styles.legalTextContent}>
            By signing above, I acknowledge that all care services were provided
            as documented. This electronic signature is legally binding
            and equivalent to a physical signature.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            size="medium"
            style={styles.button}
          />
          <Button
            title="Submit"
            onPress={handleSubmit}
            variant="primary"
            size="medium"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  signatoryContainer: {
    marginBottom: 16,
  },
  signatoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  signatoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signatoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  signatoryOptionSelected: {
    backgroundColor: '#E8EAF6',
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3F51B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3F51B5',
  },
  signatoryOptionText: {
    fontSize: 14,
    color: '#333',
  },
  relationshipContainer: {
    marginBottom: 16,
  },
  relationshipLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  relationshipOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    marginRight: 8,
    marginBottom: 8,
  },
  relationshipOptionSelected: {
    backgroundColor: '#E8EAF6',
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  relationshipOptionText: {
    fontSize: 14,
    color: '#333',
  },
  signatureContainer: {
    marginBottom: 16,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  captureButton: {
    height: 150,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  captureButtonText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: '500',
  },
  signaturePreviewContainer: {
    alignItems: 'center',
  },
  signaturePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  signaturePlaceholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  signaturePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  confirmationContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3F51B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxSelected: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#3F51B5',
  },
  confirmationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  legalText: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  legalTextContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default SignatureDocumentationForm;