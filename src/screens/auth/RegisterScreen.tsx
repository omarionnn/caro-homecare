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
import { useDispatch } from 'react-redux';
import { register } from '../../redux/slices/authSlice';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { AppDispatch } from '../../redux/store';
import { ROUTES } from '../../constants/appConstants';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear the error for this field when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };

      await dispatch(register(userData)).unwrap();
      Alert.alert(
        'Registration Successful',
        'Your account has been created. You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(ROUTES.AUTH.LOGIN),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        ...errors,
        general: error.message || 'Registration failed. Please try again.',
      });
      Alert.alert('Registration Failed', error.message || 'Please try again.');
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Sign up to start providing care
          </Text>
        </View>

        <View style={styles.formContainer}>
          {errors.general && (
            <Text style={styles.generalError}>{errors.general}</Text>
          )}

          <View style={styles.nameRow}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              placeholder="John"
              error={errors.firstName}
              containerStyle={styles.nameField}
              required
            />

            <TextField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              placeholder="Doe"
              error={errors.lastName}
              containerStyle={styles.nameField}
              required
            />
          </View>

          <TextField
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            fullWidth
            required
          />

          <TextField
            label="Username"
            value={formData.username}
            onChangeText={(value) => handleChange('username', value)}
            placeholder="Choose a username"
            autoCapitalize="none"
            error={errors.username}
            fullWidth
            required
          />

          <TextField
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            fullWidth
            required
          />

          <TextField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            fullWidth
            required
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="large"
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
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
  },
  headerContainer: {
    marginTop: 40,
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
  generalError: {
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 1,
    marginRight: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#3F51B5',
    fontWeight: '600',
  },
});

export default RegisterScreen;