import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';

interface FormDocumentationFormProps {
  onSubmit: (data: { type: string; content: string }) => void;
  onCancel: () => void;
  patientId?: string;
}

interface FormQuestion {
  id: string;
  question: string;
  type: 'text' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormAnswers {
  [questionId: string]: string | string[];
}

const FormDocumentationForm: React.FC<FormDocumentationFormProps> = ({
  onSubmit,
  onCancel,
  patientId,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample form templates
  const formTemplates: FormTemplate[] = [
    {
      id: 'vital_signs',
      title: 'Vital Signs Assessment',
      description: 'Record the patient\'s vital signs and general condition',
      questions: [
        {
          id: 'temperature',
          question: 'Temperature (°F)',
          type: 'text',
          required: true,
        },
        {
          id: 'pulse',
          question: 'Pulse (bpm)',
          type: 'text',
          required: true,
        },
        {
          id: 'respiration',
          question: 'Respiration Rate (breaths/min)',
          type: 'text',
          required: true,
        },
        {
          id: 'blood_pressure',
          question: 'Blood Pressure (mmHg)',
          type: 'text',
          required: true,
        },
        {
          id: 'pain_level',
          question: 'Pain Level (0-10)',
          type: 'radio',
          options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          required: true,
        },
        {
          id: 'general_condition',
          question: 'General Condition',
          type: 'radio',
          options: ['Good', 'Fair', 'Poor'],
          required: true,
        },
        {
          id: 'notes',
          question: 'Additional Notes',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      id: 'adl_assessment',
      title: 'Activities of Daily Living (ADL) Assessment',
      description: 'Evaluate the patient\'s ability to perform daily activities',
      questions: [
        {
          id: 'bathing',
          question: 'Bathing',
          type: 'radio',
          options: ['Independent', 'Needs Assistance', 'Dependent'],
          required: true,
        },
        {
          id: 'dressing',
          question: 'Dressing',
          type: 'radio',
          options: ['Independent', 'Needs Assistance', 'Dependent'],
          required: true,
        },
        {
          id: 'toileting',
          question: 'Toileting',
          type: 'radio',
          options: ['Independent', 'Needs Assistance', 'Dependent'],
          required: true,
        },
        {
          id: 'transferring',
          question: 'Transferring',
          type: 'radio',
          options: ['Independent', 'Needs Assistance', 'Dependent'],
          required: true,
        },
        {
          id: 'continence',
          question: 'Continence',
          type: 'radio',
          options: ['Continent', 'Occasional Accident', 'Incontinent'],
          required: true,
        },
        {
          id: 'feeding',
          question: 'Feeding',
          type: 'radio',
          options: ['Independent', 'Needs Assistance', 'Dependent'],
          required: true,
        },
        {
          id: 'notes',
          question: 'Additional Notes',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      id: 'medication_compliance',
      title: 'Medication Compliance',
      description: 'Assess the patient\'s medication adherence',
      questions: [
        {
          id: 'medication_taken',
          question: 'Were all medications taken as prescribed?',
          type: 'radio',
          options: ['Yes', 'No', 'Partially'],
          required: true,
        },
        {
          id: 'missed_medications',
          question: 'If any medications were missed, which ones?',
          type: 'text',
          required: false,
        },
        {
          id: 'side_effects',
          question: 'Any reported side effects?',
          type: 'text',
          required: false,
        },
        {
          id: 'medication_challenges',
          question: 'Challenges with medication compliance',
          type: 'checkbox',
          options: [
            'Forgetting to take medication',
            'Difficulty swallowing pills',
            'Side effects concerns',
            'Cost concerns',
            'Confusion about dosage',
            'Other',
          ],
          required: false,
        },
        {
          id: 'notes',
          question: 'Additional Notes',
          type: 'text',
          required: false,
        },
      ],
    },
  ];

  useEffect(() => {
    // Initialize answers object when a template is selected
    if (selectedTemplate) {
      const initialAnswers: FormAnswers = {};
      selectedTemplate.questions.forEach(question => {
        if (question.type === 'checkbox') {
          initialAnswers[question.id] = [];
        } else {
          initialAnswers[question.id] = '';
        }
      });
      setAnswers(initialAnswers);
    }
  }, [selectedTemplate]);

  const handleTextInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleRadioSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setAnswers(prev => {
      const currentSelections = prev[questionId] as string[] || [];
      const newSelections = currentSelections.includes(option)
        ? currentSelections.filter(item => item !== option)
        : [...currentSelections, option];
      
      return {
        ...prev,
        [questionId]: newSelections,
      };
    });
  };

  const validateForm = () => {
    if (!selectedTemplate) return false;

    let isValid = true;
    const missingFields: string[] = [];

    selectedTemplate.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        
        if (question.type === 'checkbox') {
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            isValid = false;
            missingFields.push(question.question);
          }
        } else {
          if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
            isValid = false;
            missingFields.push(question.question);
          }
        }
      }
    });

    if (!isValid) {
      Alert.alert(
        'Missing Information',
        `Please complete the following required fields:\n${missingFields.join('\n')}`,
        [{ text: 'OK' }]
      );
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!selectedTemplate) {
      Alert.alert('Error', 'Please select a form template first.');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const formData = {
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      timestamp: new Date().toISOString(),
      answers,
    };

    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSubmit({
        type: DOCUMENTATION_TYPES.FORM,
        content: JSON.stringify(formData),
      });
      setIsSubmitting(false);
    }, 500);
  };

  const renderFormSelector = () => (
    <Card variant="outlined" style={styles.formSelectorCard}>
      <Text style={styles.formSelectorTitle}>Select Assessment Form</Text>
      <Text style={styles.formSelectorSubtitle}>
        Choose the appropriate assessment form for this visit
      </Text>

      <View style={styles.templateList}>
        {formTemplates.map(template => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateItem}
            onPress={() => setSelectedTemplate(template)}
          >
            <Text style={styles.templateTitle}>{template.title}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderFormQuestion = (question: FormQuestion, index: number) => {
    switch (question.type) {
      case 'text':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.question}
              {question.required && <Text style={styles.requiredAsterisk}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={answers[question.id] as string || ''}
              onChangeText={(value) => handleTextInputChange(question.id, value)}
              placeholder="Enter your answer"
              placeholderTextColor="#999"
              multiline={question.question.includes('Notes')}
              numberOfLines={question.question.includes('Notes') ? 3 : 1}
            />
          </View>
        );
      
      case 'radio':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.question}
              {question.required && <Text style={styles.requiredAsterisk}> *</Text>}
            </Text>
            <View style={styles.radioOptions}>
              {question.options?.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.radioOption,
                    answers[question.id] === option && styles.radioOptionSelected,
                  ]}
                  onPress={() => handleRadioSelect(question.id, option)}
                >
                  <View style={styles.radioButton}>
                    {answers[question.id] === option && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.radioOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'checkbox':
        const selectedOptions = (answers[question.id] as string[]) || [];
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.question}
              {question.required && <Text style={styles.requiredAsterisk}> *</Text>}
            </Text>
            <View style={styles.checkboxOptions}>
              {question.options?.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.checkboxOption}
                  onPress={() => handleCheckboxToggle(question.id, option)}
                >
                  <View style={styles.checkbox}>
                    {selectedOptions.includes(option) && (
                      <View style={styles.checkboxSelected} />
                    )}
                  </View>
                  <Text style={styles.checkboxOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderSelectedForm = () => {
    if (!selectedTemplate) return null;

    return (
      <Card variant="outlined" style={styles.formCard}>
        <View style={styles.formHeader}>
          <View>
            <Text style={styles.formTitle}>{selectedTemplate.title}</Text>
            <Text style={styles.formDescription}>{selectedTemplate.description}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeFormButton}
            onPress={() => setSelectedTemplate(null)}
          >
            <Text style={styles.changeFormText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formQuestions}>
          {selectedTemplate.questions.map((question, index) =>
            renderFormQuestion(question, index)
          )}
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
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedTemplate ? renderSelectedForm() : renderFormSelector()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  formSelectorCard: {
    marginBottom: 16,
  },
  formSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSelectorSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  templateList: {
    marginBottom: 16,
  },
  templateItem: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
  },
  formCard: {
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
  },
  changeFormButton: {
    padding: 4,
  },
  changeFormText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  formQuestions: {
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  requiredAsterisk: {
    color: '#F44336',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  radioOptions: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  radioOptionSelected: {
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
  radioOptionText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxOptions: {
    marginTop: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
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
  },
  checkboxSelected: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#3F51B5',
  },
  checkboxOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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

export default FormDocumentationForm;