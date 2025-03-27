import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { DOCUMENTATION_TYPES } from '../../../constants/appConstants';

interface AudioDocumentationFormProps {
  onSubmit: (data: { type: string; content: string }) => void;
  onCancel: () => void;
}

const AudioDocumentationForm: React.FC<AudioDocumentationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer for recording simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          // Auto-stop at 60 seconds
          if (prevTime >= 60) {
            setIsRecording(false);
            setAudioFile('audio_recording_placeholder');
            return prevTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const handleStartRecording = () => {
    // In a real app, this would use a library like react-native-audio-recorder-player
    Alert.alert(
      'Audio Recording',
      'In a real app, this would start recording audio. For this demo, we\'ll simulate recording.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Simulated Recording',
          onPress: () => {
            setIsRecording(true);
            setRecordingTime(0);
          },
        },
      ]
    );
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setAudioFile('audio_recording_placeholder');
    
    // In a real app, this would actually stop the recording
    Alert.alert(
      'Recording Stopped',
      'Your audio has been recorded successfully.',
      [{ text: 'OK' }]
    );
  };

  const handlePlayRecording = () => {
    // In a real app, this would play the recorded audio
    Alert.alert(
      'Audio Playback',
      'In a real app, this would play the recorded audio. For this demo, we\'ll just show this message.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setAudioFile(null);
            setRecordingTime(0);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!audioFile) {
      Alert.alert('Missing Audio', 'Please record audio first.');
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, we would upload the audio file to a server
    // For this demo, we'll just use a placeholder string
    const audioData = {
      uri: audioFile,
      duration: recordingTime,
      description: description.trim(),
    };

    // Simulate a slight delay for better UX
    setTimeout(() => {
      onSubmit({
        type: DOCUMENTATION_TYPES.AUDIO,
        content: JSON.stringify(audioData),
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Card variant="outlined" style={styles.formCard}>
      <Text style={styles.formTitle}>Voice Note Documentation</Text>
      <Text style={styles.formSubtitle}>
        Record a voice note to document your observations
      </Text>

      <View style={styles.audioContainer}>
        {!audioFile ? (
          <View style={styles.recordingContainer}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
              {isRecording && <View style={styles.recordingIndicator} />}
            </View>
            
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording ? styles.recordingActive : null,
              ]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playbackContainer}>
            <View style={styles.playbackHeader}>
              <Text style={styles.recordingLengthText}>
                Recording Length: {formatTime(recordingTime)}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteRecording}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayRecording}
            >
              <Text style={styles.playButtonIcon}>▶️</Text>
              <Text style={styles.playButtonText}>Play Recording</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>
          Description (Optional)
        </Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Enter a description for this recording..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Voice Note Guidelines:</Text>
        <Text style={styles.helpText}>
          • Speak clearly and at a moderate pace
        </Text>
        <Text style={styles.helpText}>
          • Limit recordings to 1-2 minutes when possible
        </Text>
        <Text style={styles.helpText}>
          • Start by stating the date and time
        </Text>
        <Text style={styles.helpText}>
          • Focus on objective observations
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
          disabled={isSubmitting || !audioFile}
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
  audioContainer: {
    marginBottom: 16,
  },
  recordingContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  recordButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  recordingActive: {
    backgroundColor: '#F44336',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playbackContainer: {
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingLengthText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  playButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  playButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
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

export default AudioDocumentationForm;