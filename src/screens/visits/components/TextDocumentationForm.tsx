import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';

interface TextDocumentationFormProps {
  onSubmit: (data: { type: string; content: string }) => void;
  onCancel: () => void;
  initialValue?: string;
}

const TextDocumentationForm: React.FC<TextDocumentationFormProps> = ({
  onSubmit,
  onCancel,
  initialValue = '',
}) => {
  const [text, setText] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;

    setIsSubmitting(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSubmit({
        type: DOCUMENTATION_TYPES.TEXT,
        content: text.trim(),
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined" style={styles.formCard}>
          <Text style={styles.formTitle}>Text Documentation</Text>
          <Text style={styles.formSubtitle}>
            Enter detailed notes about the visit, observations, or any other relevant information.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your notes here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
            />
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Documentation Guidelines:</Text>
            <Text style={styles.helpText}>
              • Be objective and factual in your documentation
            </Text>
            <Text style={styles.helpText}>
              • Include all relevant details about the visit
            </Text>
            <Text style={styles.helpText}>
              • Document any unusual occurrences or concerns
            </Text>
            <Text style={styles.helpText}>
              • Note the patient's response to care
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
              disabled={isSubmitting || !text.trim()}
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 150,
    maxHeight: 300,
  },
  helpContainer: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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

export default TextDocumentationForm;