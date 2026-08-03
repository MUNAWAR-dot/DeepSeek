import React, { useState, useEffect, useRef } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import {
  signInWithGoogle,
  signInWithPhone,
  signInWithEmail,
} from '../../services/firebase';
import { useTheme } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loginMethod, setLoginMethod] = useState('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      setErrorMessage(error.message);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const user = await signInWithEmail(email, password);
      setUser(user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    navigation.navigate('PhoneAuth');
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const renderMainScreen = () => (
    <Animatable.View animation="fadeInUp" duration={1000} style={styles.mainContainer}>
      <Animatable.View animation="bounceIn" duration={1500}>
        <LinearGradient
          colors={['#075E54', '#128C7E', '#25D366']}
          style={styles.logoContainer}
        >
          <Icon name="chat" size={60} color="#fff" />
        </LinearGradient>
      </Animatable.View>

      <Animatable.Text animation="fadeIn" delay={500} style={styles.title}>
        ChatsApp
      </Animatable.Text>

      <Animatable.Text animation="fadeIn" delay={700} style={styles.subtitle}>
        {t('app.tagline')}
      </Animatable.Text>

      <View style={styles.buttonContainer}>
        <Animatable.View animation="slideInLeft" delay={900}>
          <TouchableOpacity
            style={[styles.button, styles.phoneButton]}
            onPress={handlePhoneLogin}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={24} color="#fff" />
            <Text style={styles.buttonText}>{t('auth.loginWithPhone')}</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="slideInRight" delay={1100}>
          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={() => setLoginMethod('email')}
            activeOpacity={0.8}
          >
            <Icon name="email" size={24} color="#fff" />
            <Text style={styles.buttonText}>{t('auth.loginWithEmail')}</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="slideInUp" delay={1300}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Icon name="google" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? 'Connecting...' : t('auth.loginWithGoogle')}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      <Animatable.View animation="fadeIn" delay={1500} style={styles.footer}>
        <Text style={styles.termsText}>
          {t('auth.termsAndConditions')}
        </Text>
        
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.createAccountText}>
            {t('auth.dontHaveAccount')} <Text style={styles.createAccountLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </Animatable.View>
  );

  const renderEmailScreen = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.formContainer}
    >
      <Animatable.View animation="fadeInDown" style={styles.formHeader}>
        <TouchableOpacity 
          onPress={() => {
            setLoginMethod('main');
            setErrorMessage('');
          }}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Sign in with Email</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300} style={styles.inputContainer}>
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
            autoCorrect={false}
            placeholderTextColor="#667781"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="lock-outline" size={20} color="#667781" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
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

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            style={styles.gradientButton}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotButtonText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signUpButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </Animatable.View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loginMethod === 'main' && renderMainScreen()}
        {loginMethod === 'email' && renderEmailScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#075E54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#667781',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    marginVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  phoneButton: {
    backgroundColor: '#25D366',
  },
  emailButton: {
    backgroundColor: '#128C7E',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#667781',
    textAlign: 'center',
    marginBottom: 15,
  },
  createAccountButton: {
    padding: 10,
  },
  createAccountText: {
    fontSize: 14,
    color: '#667781',
  },
  createAccountLink: {
    color: '#25D366',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075E54',
  },
  inputContainer: {
    width: '100%',
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
  submitButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotButtonText: {
    color: '#128C7E',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#667781',
    fontSize: 14,
  },
  signUpButton: {
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: 25,
  },
  signUpButtonText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
