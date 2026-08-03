import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import { confirmPhoneCode } from '../../services/firebase';
import { createUserProfileIfNeeded } from '../../services/firebase';
import { useTheme } from '../../config/theme';

const OTPScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirmation, phoneNumber } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setErrorMessage('');

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (text && index === 5) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        handleVerify(otpCode);
      }
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      
      const user = await confirmPhoneCode(confirmation, code);
      await createUserProfileIfNeeded(user);
      setUser(user);
    } catch (error) {
      setErrorMessage('Invalid verification code. Please try again.');
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setCanResend(false);
      setTimer(60);
      setErrorMessage('');
      
      // Resend code logic here
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
    } catch (error) {
      setErrorMessage('Failed to resend code. Please try again.');
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const last4 = phone.slice(-4);
    return `*******${last4}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animatable.View animation="fadeInDown" style={styles.content}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Animatable.View animation="bounceIn" delay={300}>
              <Icon name="shield-check" size={60} color="#25D366" />
            </Animatable.View>
            
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
            </Text>
          </View>

          {errorMessage ? (
            <Animatable.View animation="shake" style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animatable.View>
          ) : null}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={100 * index}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                ]}
              >
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              </Animatable.View>
            ))}
          </View>

          <View style={styles.timerContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend code in <Text style={styles.timerCount}>{timer}s</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.buttonDisabled]}
            onPress={() => handleVerify()}
            disabled={loading || otp.join('').length !== 6}
            activeOpacity={0.8}
          >
            <Animatable.View
              animation={loading ? 'pulse' : undefined}
              iterationCount="infinite"
              style={[
                styles.verifyButtonGradient,
                otp.join('').length !== 6 && styles.verifyButtonDisabled,
              ]}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
            </Animatable.View>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Icon name="help-circle-outline" size={20} color="#667781" />
            <Text style={styles.helpText}>
              Didn't receive the code? Check your spam folder or try again.
            </Text>
          </View>
        </Animatable.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075E54',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#667781',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    color: '#075E54',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD7D7',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  otpBoxFilled: {
    borderColor: '#25D366',
    backgroundColor: '#F0FFF0',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075E54',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#667781',
  },
  timerCount: {
    color: '#25D366',
    fontWeight: '600',
  },
  resendText: {
    fontSize: 16,
    color: '#25D366',
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  verifyButtonGradient: {
    backgroundColor: '#25D366',
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  helpText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#667781',
  },
});

export default OTPScreen;
