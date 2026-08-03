import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../../config/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      
      await auth().sendPasswordResetEmail(email);
      setEmailSent(true);
    } catch (error) {
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </Animatable.View>

          {!emailSent ? (
            <Animatable.View animation="fadeInUp" delay={300}>
              <View style={styles.iconContainer}>
                <Icon name="lock-reset" size={60} color="#25D366" />
              </View>
              
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              {errorMessage ? (
                <Animatable.View animation="shake" style={styles.errorContainer}>
                  <Icon name="alert-circle" size={20} color="#FF3B30" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animatable.View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Icon name="email-outline" size={20} color="#667781" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#667781"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ) : (
            <Animatable.View animation="fadeInUp" delay={300} style={styles.successContainer}>
              <Animatable.View animation="bounceIn" delay={500}>
                <Icon name="email-check" size={80} color="#25D366" />
              </Animatable.View>
              
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to{' '}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              <Text style={styles.instructionText}>
                Please check your email and follow the instructions to reset your password.
                If you don't see the email, check your spam folder.
              </Text>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>
                  Didn't receive the email? Resend
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#667781',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFD7D7',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#075E54',
  },
  submitButton: {
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075E54',
    marginTop: 20,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#667781',
    textAlign: 'center',
    marginBottom: 15,
  },
  emailText: {
    color: '#075E54',
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#667781',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  backToLoginButton: {
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 10,
  },
  resendButtonText: {
    color: '#128C7E',
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
