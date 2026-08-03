import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import CountryPicker from 'react-native-country-picker-modal';
import { useTranslation } from 'react-i18next';
import { signInWithPhone } from '../../services/firebase';
import { useTheme } from '../../config/theme';

const PhoneAuthScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const phoneInputRef = useRef(null);

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCallingCode(`+${country.callingCode[0]}`);
  };

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      
      const fullPhoneNumber = `${callingCode}${phoneNumber.replace(/^0+/, '')}`;
      const confirmation = await signInWithPhone(fullPhoneNumber);
      
      navigation.navigate('OTP', {
        confirmation,
        phoneNumber: fullPhoneNumber,
      });
    } catch (error) {
      setErrorMessage(error.message);
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
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
        >
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Phone Number</Text>
            <Text style={styles.subtitle}>
              We will send you a verification code to your phone number
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
            {errorMessage ? (
              <Animatable.View animation="shake" style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Animatable.View>
            ) : null}

            <View style={styles.phoneInputContainer}>
              <TouchableOpacity
                style={styles.countryPicker}
                onPress={() => setCountryPickerVisible(true)}
              >
                <CountryPicker
                  visible={countryPickerVisible}
                  onSelect={onSelectCountry}
                  onClose={() => setCountryPickerVisible(false)}
                  withFilter
                  withFlag
                  withCountryNameButton
                  withAlphaFilter
                  countryCode={countryCode}
                  preferredCountries={['IN', 'CN', 'PK', 'BD', 'ID', 'JP', 'KR']}
                />
                <Text style={styles.callingCode}>{callingCode}</Text>
                <Icon name="chevron-down" size={20} color="#667781" />
              </TouchableOpacity>

              <View style={styles.phoneInputWrapper}>
                <TextInput
                  ref={phoneInputRef}
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    setErrorMessage('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={15}
                  placeholderTextColor="#667781"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Animatable.View
                animation={loading ? 'pulse' : undefined}
                iterationCount="infinite"
                style={styles.sendButtonGradient}
              >
                <Icon name="send" size={20} color="#fff" style={styles.sendIcon} />
                <Text style={styles.sendButtonText}>
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </Text>
              </Animatable.View>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Icon name="information-outline" size={20} color="#667781" />
              <Text style={styles.infoText}>
                Carrier charges may apply for SMS verification
              </Text>
            </View>
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
    lineHeight: 22,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  callingCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075E54',
    marginHorizontal: 8,
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  phoneInput: {
    padding: 15,
    fontSize: 16,
    color: '#075E54',
  },
  sendButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sendButtonGradient: {
    backgroundColor: '#25D366',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#667781',
  },
});

export default PhoneAuthScreen;
