import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';

interface ImageDocumentationFormProps {
  onSubmit: (data: { type: string; content: string }) => void;
  onCancel: () => void;
}

const ImageDocumentationForm: React.FC<ImageDocumentationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [caption, setCaption] = useState('');
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, this would use react-native-image-picker or similar
  const handleTakePhoto = () => {
    // Simulate taking a photo
    Alert.alert(
      'Camera Functionality',
      'In a real app, this would open the camera. For this demo, we\'ll simulate capturing an image.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Simulate Capture',
          onPress: () => {
            // Simulate a successful image capture with a placeholder
            setImageSource('placeholder_image');
          },
        },
      ]
    );
  };

  const handleChooseFromLibrary = () => {
    // Simulate choosing from library
    Alert.alert(
      'Image Library',
      'In a real app, this would open the image picker. For this demo, we\'ll simulate selecting an image.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Simulate Selection',
          onPress: () => {
            // Simulate a successful image selection with a placeholder
            setImageSource('placeholder_image');
          },
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!imageSource) {
      Alert.alert('Missing Image', 'Please capture or select an image first.');
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, we would upload the image to a server
    // For this demo, we'll just use a placeholder string
    const imageData = {
      uri: imageSource,
      caption: caption.trim(),
    };

    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSubmit({
        type: DOCUMENTATION_TYPES.IMAGE,
        content: JSON.stringify(imageData),
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Card variant="outlined" style={styles.formCard}>
      <Text style={styles.formTitle}>Image Documentation</Text>
      <Text style={styles.formSubtitle}>
        Capture or upload an image related to the visit
      </Text>

      <View style={styles.imageContainer}>
        {imageSource ? (
          <View style={styles.previewContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Image Preview</Text>
              <Text style={styles.imagePlaceholderSubtext}>
                (Actual image capture not implemented in demo)
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={() => setImageSource(null)}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageOptions}>
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.imageOptionIcon}>📷</Text>
              <Text style={styles.imageOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={handleChooseFromLibrary}
            >
              <Text style={styles.imageOptionIcon}>🖼️</Text>
              <Text style={styles.imageOptionText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.captionLabel}>Image Caption (Optional)</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Enter a caption for this image..."
          placeholderTextColor="#999"
          value={caption}
          onChangeText={setCaption}
          maxLength={100}
        />
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Image Guidelines:</Text>
        <Text style={styles.helpText}>
          • Ensure proper lighting when taking photos
        </Text>
        <Text style={styles.helpText}>
          • Capture clear, focused images
        </Text>
        <Text style={styles.helpText}>
          • Include a sense of scale when needed
        </Text>
        <Text style={styles.helpText}>
          • Be mindful of patient privacy and dignity
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
          disabled={isSubmitting || !imageSource}
          style={styles.button}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
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
  imageContainer: {
    marginBottom: 16,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageOptionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    height: 120,
  },
  imageOptionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  retakeButton: {
    padding: 8,
  },
  retakeButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  captionContainer: {
    marginBottom: 16,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
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

export default ImageDocumentationForm;