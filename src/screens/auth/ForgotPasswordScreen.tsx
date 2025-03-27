import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { apiService } from '../../services/apiService';
import { ENDPOINTS } from '../../constants/apiConstants';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { ROUTES } from '../../constants/appConstants';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetSent, setIsResetSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await apiService.post(ENDPOINTS.AUTH.PASSWORD_RESET, { email });
      setIsResetSent(true);
      Alert.alert(
        'Reset Link Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Password reset failed:', error);
      setError(
        error.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email address to receive a password reset link
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {isResetSent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Reset link sent to your email address. Please check your inbox.
              </Text>
              <Button
                title="Back to Login"
                onPress={navigateToLogin}
                variant="primary"
                size="large"
                fullWidth
                style={styles.backButton}
              />
            </View>
          ) : (
            <>
              <TextField
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error || undefined}
                fullWidth
                required
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                variant="primary"
                size="large"
                isLoading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.resetButton}
              />
            </>
          )}

          <TouchableOpacity onPress={navigateToLogin} style={styles.backLinkContainer}>
            <Text style={styles.backLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 20,
  },
  backLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backLink: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    marginVertical: 20,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;