import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { VisitDocument } from '../../../redux/slices/visitSlice';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';
import { formatDate } from '../../../utils/dateUtils';

interface DocumentationListProps {
  visitId: string;
  documents: VisitDocument[];
  onSelectDocumentType: (type: string) => void;
}

interface DocumentTypeButton {
  type: string;
  label: string;
  description: string;
}

const DocumentationList: React.FC<DocumentationListProps> = ({
  visitId,
  documents,
  onSelectDocumentType,
}) => {
  const documentTypes: DocumentTypeButton[] = [
    {
      type: 'text',
      label: 'Text Note',
      description: 'Add a text-based note or observation',
    },
    {
      type: 'image',
      label: 'Image',
      description: 'Take or upload a relevant photo',
    },
    {
      type: 'audio',
      label: 'Voice Note',
      description: 'Record an audio observation',
    },
    {
      type: 'form',
      label: 'Form',
      description: 'Complete a structured assessment form',
    },
    {
      type: 'signature',
      label: 'Signature',
      description: 'Capture electronic signature',
    },
  ];

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case DOCUMENTATION_TYPES.TEXT:
        return '📝';
      case DOCUMENTATION_TYPES.IMAGE:
        return '📷';
      case DOCUMENTATION_TYPES.AUDIO:
        return '🎤';
      case DOCUMENTATION_TYPES.FORM:
        return '📋';
      case DOCUMENTATION_TYPES.SIGNATURE:
        return '✍️';
      default:
        return '📄';
    }
  };

  const renderDocumentItem = ({ item }: { item: VisitDocument }) => {
    const icon = getDocumentTypeIcon(item.type);
    const date = new Date(item.createdAt);

    return (
      <Card variant="outlined" style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.documentIcon}>{icon}</Text>
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Documentation
            </Text>
            <Text style={styles.documentDate}>
              Added on {formatDate(date)} at {date.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {item.type === DOCUMENTATION_TYPES.TEXT && (
          <Text style={styles.textContent}>{item.content}</Text>
        )}

        {item.type === DOCUMENTATION_TYPES.IMAGE && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.imageCaption}>Image captured</Text>
          </View>
        )}

        {item.type === DOCUMENTATION_TYPES.AUDIO && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioInfo}>Audio recording (tap to play)</Text>
          </View>
        )}

        {item.type === DOCUMENTATION_TYPES.FORM && (
          <Text style={styles.formContent}>Form completed</Text>
        )}

        {item.type === DOCUMENTATION_TYPES.SIGNATURE && (
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureInfo}>Signature captured</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Card variant="filled" style={styles.addDocumentationCard}>
        <Text style={styles.addDocumentationTitle}>Add Documentation</Text>
        <Text style={styles.addDocumentationSubtitle}>
          Choose a documentation type to add
        </Text>

        <View style={styles.documentTypesContainer}>
          {documentTypes.map((docType) => (
            <TouchableOpacity
              key={docType.type}
              style={styles.documentTypeButton}
              onPress={() => onSelectDocumentType(docType.type)}
            >
              <Text style={styles.documentTypeIcon}>
                {getDocumentTypeIcon(docType.type)}
              </Text>
              <Text style={styles.documentTypeLabel}>{docType.label}</Text>
              <Text style={styles.documentTypeDescription}>
                {docType.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <View style={styles.documentsListContainer}>
        <Text style={styles.documentsListTitle}>
          Documentation ({documents.length})
        </Text>

        {documents.length === 0 ? (
          <Card variant="outlined" style={styles.emptyDocumentsCard}>
            <Text style={styles.emptyDocumentsText}>
              No documentation has been added yet. Use the options above to add documentation.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderDocumentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addDocumentationCard: {
    backgroundColor: '#E8EAF6',
    marginBottom: 16,
  },
  addDocumentationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addDocumentationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  documentTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentTypeButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  documentTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  documentTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentTypeDescription: {
    fontSize: 12,
    color: '#666',
  },
  documentsListContainer: {
    flex: 1,
  },
  documentsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyDocumentsCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDocumentsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  documentCard: {
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentIcon: {
    fontSize: 20,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#666',
  },
  textContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  imagePreviewContainer: {
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCaption: {
    fontSize: 14,
    color: '#666',
  },
  audioContainer: {
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    fontSize: 14,
    color: '#666',
  },
  formContent: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  signatureContainer: {
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signatureInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default DocumentationList;