import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const AccountScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, logout } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChangeNumber = () => {
    Alert.alert(
      'Change Phone Number',
      'Are you sure you want to change your phone number?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('PhoneAuth'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userService.deleteAccount(user.uid);
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRequestInfo = () => {
    Alert.alert(
      'Request Account Info',
      'We will compile your account information and send it to your email. This may take up to 3 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            Alert.alert('Success', 'Your request has been submitted.');
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Phone Number',
      value: user?.phoneNumber || 'Not set',
      icon: 'phone',
      onPress: handleChangeNumber,
    },
    {
      title: 'Email',
      value: user?.email || 'Not set',
      icon: 'email',
    },
    {
      title: 'Two-Factor Authentication',
      value: 'Off',
      icon: 'shield-key',
      onPress: () => {},
    },
    {
      title: 'Linked Devices',
      value: '0 devices',
      icon: 'devices',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={!item.onPress}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                    {item.value}
                  </Text>
                </View>
                {item.onPress && (
                  <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <TouchableOpacity
            style={[styles.requestButton, { backgroundColor: theme.colors.card }]}
            onPress={handleRequestInfo}
          >
            <Icon name="download" size={24} color={theme.colors.text} />
            <Text style={[styles.requestText, { color: theme.colors.text }]}>
              Request Account Info
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.colors.card }]}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete-forever" size={24} color="#FF3B30" />
            <Text style={styles.deleteText}>Delete My Account</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  requestText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen;
