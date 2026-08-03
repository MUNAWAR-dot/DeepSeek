import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

const PrivacyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, updateUserProfile } = useStore();
  
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: user?.privacy?.lastSeen || 'everyone',
    profilePhoto: user?.privacy?.profilePhoto || 'everyone',
    about: user?.privacy?.about || 'everyone',
    status: user?.privacy?.status || 'my_contacts',
    readReceipts: user?.privacy?.readReceipts !== false,
    groups: user?.privacy?.groups || 'everyone',
    liveLocation: user?.privacy?.liveLocation || 'my_contacts',
    fingerprintLock: user?.privacy?.fingerprintLock || false,
    screenSecurity: user?.privacy?.screenSecurity || false,
  });

  const handleUpdatePrivacy = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);

    try {
      await userService.updatePrivacySettings(user.uid, newSettings);
      updateUserProfile({ privacy: newSettings });
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings');
      setPrivacySettings({ ...privacySettings });
    }
  };

  const showOptionPicker = (key, title, options) => {
    Alert.alert(
      title,
      'Choose who can see this',
      options.map((option) => ({
        text: option.label,
        onPress: () => handleUpdatePrivacy(key, option.value),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const privacyOptions = {
    lastSeen: [
      { label: 'Everyone', value: 'everyone' },
      { label: 'My Contacts', value: 'my_contacts' },
      { label: 'Nobody', value: 'nobody' },
    ],
    profilePhoto: [
      { label: 'Everyone', value: 'everyone' },
      { label: 'My Contacts', value: 'my_contacts' },
      { label: 'Nobody', value: 'nobody' },
    ],
    about: [
      { label: 'Everyone', value: 'everyone' },
      { label: 'My Contacts', value: 'my_contacts' },
      { label: 'Nobody', value: 'nobody' },
    ],
    status: [
      { label: 'My Contacts', value: 'my_contacts' },
      { label: 'My Contacts Except...', value: 'my_contacts_except' },
      { label: 'Only Share With...', value: 'only_share_with' },
    ],
    groups: [
      { label: 'Everyone', value: 'everyone' },
      { label: 'My Contacts', value: 'my_contacts' },
      { label: 'My Contacts Except...', value: 'my_contacts_except' },
    ],
  };

  const getPrivacyValueLabel = (key) => {
    const value = privacySettings[key];
    const options = privacyOptions[key];
    if (!options) return value;
    const option = options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Who can see my personal info
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showOptionPicker('lastSeen', 'Last Seen', privacyOptions.lastSeen)}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Last Seen
              </Text>
              <View style={styles.settingValue}>
                <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                  {getPrivacyValueLabel('lastSeen')}
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showOptionPicker('profilePhoto', 'Profile Photo', privacyOptions.profilePhoto)}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Profile Photo
              </Text>
              <View style={styles.settingValue}>
                <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                  {getPrivacyValueLabel('profilePhoto')}
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showOptionPicker('about', 'About', privacyOptions.about)}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                About
              </Text>
              <View style={styles.settingValue}>
                <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                  {getPrivacyValueLabel('about')}
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showOptionPicker('status', 'Status', privacyOptions.status)}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Status
              </Text>
              <View style={styles.settingValue}>
                <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                  {getPrivacyValueLabel('status')}
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleUpdatePrivacy('readReceipts', !privacySettings.readReceipts)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Read Receipts
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  If turned off, you won't send or receive read receipts
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  privacySettings.readReceipts && styles.toggleActive,
                ]}
                onPress={() => handleUpdatePrivacy('readReceipts', !privacySettings.readReceipts)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    privacySettings.readReceipts && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showOptionPicker('groups', 'Groups', privacyOptions.groups)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Groups
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Who can add me to groups
                </Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
                  {getPrivacyValueLabel('groups')}
                </Text>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Security
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleUpdatePrivacy('fingerprintLock', !privacySettings.fingerprintLock)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Fingerprint Lock
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Require fingerprint to open ChatsApp
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  privacySettings.fingerprintLock && styles.toggleActive,
                ]}
                onPress={() => handleUpdatePrivacy('fingerprintLock', !privacySettings.fingerprintLock)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    privacySettings.fingerprintLock && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleUpdatePrivacy('screenSecurity', !privacySettings.screenSecurity)}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Screen Security
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Block screenshots in recent apps list
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  privacySettings.screenSecurity && styles.toggleActive,
                ]}
                onPress={() => handleUpdatePrivacy('screenSecurity', !privacySettings.screenSecurity)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    privacySettings.screenSecurity && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('BlockedContacts')}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Blocked Contacts
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 5,
    textTransform: 'uppercase',
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
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: '#25D366',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});

export default PrivacyScreen;
