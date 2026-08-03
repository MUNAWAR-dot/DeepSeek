import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, updateUserProfile } = useStore();

  const [settings, setSettings] = useState({
    messageNotifications: true,
    groupNotifications: true,
    callNotifications: true,
    notificationTone: 'default',
    vibrate: true,
    popupNotification: false,
    light: true,
    useHighPriority: true,
    reactionNotifications: true,
    inAppNotifications: true,
    preview: true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      setLoading(true);
      await userService.updateNotificationSettings(user.uid, newSettings);
      updateUserProfile({ notificationSettings: newSettings });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const handleToneSelect = () => {
    Alert.alert(
      'Notification Tone',
      'Select a tone',
      [
        { text: 'Default', onPress: () => updateSetting('notificationTone', 'default') },
        { text: 'Chime', onPress: () => updateSetting('notificationTone', 'chime') },
        { text: 'Bell', onPress: () => updateSetting('notificationTone', 'bell') },
        { text: 'Silent', onPress: () => updateSetting('notificationTone', 'silent') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await userService.updateNotificationSettings(user.uid, newSettings);
    } catch (error) {
      console.error('Update setting failed:', error);
    }
  };

  const notificationSections = [
    {
      title: 'Messages',
      items: [
        {
          label: t('notifications.messageNotifications'),
          type: 'toggle',
          key: 'messageNotifications',
          value: settings.messageNotifications,
        },
        {
          label: t('notifications.groupNotifications'),
          type: 'toggle',
          key: 'groupNotifications',
          value: settings.groupNotifications,
        },
        {
          label: t('notifications.callNotifications'),
          type: 'toggle',
          key: 'callNotifications',
          value: settings.callNotifications,
        },
      ],
    },
    {
      title: 'Tone & Vibration',
      items: [
        {
          label: t('notifications.notificationTone'),
          type: 'select',
          key: 'notificationTone',
          value: settings.notificationTone,
          onPress: handleToneSelect,
        },
        {
          label: t('notifications.vibrate'),
          type: 'toggle',
          key: 'vibrate',
          value: settings.vibrate,
        },
      ],
    },
    {
      title: 'Display',
      items: [
        {
          label: t('notifications.popupNotification'),
          type: 'toggle',
          key: 'popupNotification',
          value: settings.popupNotification,
        },
        {
          label: t('notifications.light'),
          type: 'toggle',
          key: 'light',
          value: settings.light,
        },
        {
          label: t('notifications.useHighPriority'),
          type: 'toggle',
          key: 'useHighPriority',
          value: settings.useHighPriority,
        },
        {
          label: t('notifications.reactionNotifications'),
          type: 'toggle',
          key: 'reactionNotifications',
          value: settings.reactionNotifications,
        },
      ],
    },
    {
      title: 'In-App',
      items: [
        {
          label: t('notifications.inAppNotifications'),
          type: 'toggle',
          key: 'inAppNotifications',
          value: settings.inAppNotifications,
        },
        {
          label: t('notifications.preview'),
          type: 'toggle',
          key: 'preview',
          value: settings.preview,
        },
      ],
    },
  ];

  const renderSettingItem = (item, index) => (
    <View
      key={index}
      style={[
        styles.settingItem,
        { backgroundColor: theme.colors.card },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          {item.label}
        </Text>
        {item.type === 'select' && (
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {item.value}
          </Text>
        )}
      </View>

      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={() => handleToggle(item.key)}
          trackColor={{ false: '#D1D1D6', true: '#34C759' }}
          thumbColor="#fff"
          ios_backgroundColor="#D1D1D6"
        />
      ) : (
        <TouchableOpacity onPress={item.onPress}>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('notifications.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notificationSections.map((section, sectionIndex) => (
          <Animatable.View
            key={sectionIndex}
            animation="fadeInUp"
            delay={200 + sectionIndex * 100}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </Animatable.View>
        ))}

        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              Alert.alert(
                'Reset Notifications',
                'Reset all notification settings to default?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    onPress: () => {
                      setSettings({
                        messageNotifications: true,
                        groupNotifications: true,
                        callNotifications: true,
                        notificationTone: 'default',
                        vibrate: true,
                        popupNotification: false,
                        light: true,
                        useHighPriority: true,
                        reactionNotifications: true,
                        inAppNotifications: true,
                        preview: true,
                      });
                    },
                  },
                ]
              );
            }}
          >
            <Icon name="restore" size={20} color="#FF3B30" />
            <Text style={styles.resetText}>Reset Notification Settings</Text>
          </TouchableOpacity>
        </View>
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
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  resetContainer: {
    marginTop: 30,
    marginHorizontal: 15,
    marginBottom: 40,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  resetText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
