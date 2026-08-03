import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import { signInWithEmail } from '../../services/firebase';
import { createUserProfile } from '../../services/firebase';
import { useTheme } from '../../config/theme';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const setUser = useStore((state) => state.setUser);

  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
    if (!email || !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service');
      return false;
    }
    return true;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMessage('');
      
      const user = await signInWithEmail(email, password, true);
      
      // Update user profile with full name
      await user.updateProfile({
        displayName: fullName,
      });

      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        displayName: fullName,
        email: email,
      });

      setUser(user);
    } catch (error) {
      setErrorMessage(error.message);
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
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
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ChatsApp and connect with friends</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
            {errorMessage ? (
              <Animatable.View animation="shake" style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Animatable.View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color="#667781" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setErrorMessage('');
                }}
                placeholderTextColor="#667781"
              />
            </View>

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

            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color="#667781" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#667781"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#667781" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Icon name="lock-check-outline" size={20} color="#667781" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#667781"
              />
            </View>

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <Icon 
                name={agreedToTerms ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                size={24} 
                color={agreedToTerms ? '#25D366' : '#667781'} 
              />
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Animatable.View
                animation={loading ? 'pulse' : undefined}
                iterationCount="infinite"
                style={styles.registerButtonGradient}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </Animatable.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
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
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#667781',
  },
  formContainer: {
    flex: 1,
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
    marginBottom: 15,
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
  eyeIcon: {
    padding: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#667781',
  },
  termsLink: {
    color: '#25D366',
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
  },
  registerButtonGradient: {
    backgroundColor: '#25D366',
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButton: {
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    color: '#667781',
  },
  loginLink: {
    color: '#25D366',
    fontWeight: '600',
  },
});

export default RegisterScreen;
