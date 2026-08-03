import React from 'react';
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
import Avatar from '../../components/Common/Avatar';
import { signOut } from '../../services/firebase';
import { useTheme } from '../../config/theme';

const SettingsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete account logic
            Alert.alert('Info', 'Account deletion requested');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: '',
      items: [
        {
          icon: 'account-circle',
          label: t('settings.profile'),
          color: '#25D366',
          onPress: () => navigation.navigate('Profile'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'shield-check',
          label: t('settings.privacy'),
          color: '#2196F3',
          onPress: () => navigation.navigate('Privacy'),
        },
        {
          icon: 'bell-ring',
          label: t('settings.notifications'),
          color: '#FF9800',
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          icon: 'database',
          label: t('settings.dataStorage'),
          color: '#4CAF50',
          onPress: () => navigation.navigate('Storage'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'theme-light-dark',
          label: t('settings.darkMode'),
          color: '#9C27B0',
          toggle: true,
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          icon: 'translate',
          label: t('settings.language'),
          color: '#00BCD4',
          value: 'English',
          onPress: () => navigation.navigate('Language'),
        },
        {
          icon: 'wallpaper',
          label: 'Chat Wallpaper',
          color: '#E91E63',
          onPress: () => {},
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'help-circle',
          label: t('settings.help'),
          color: '#607D8B',
          onPress: () => {},
        },
        {
          icon: 'information',
          label: t('settings.about'),
          color: '#795548',
          onPress: () => navigation.navigate('About'),
        },
        {
          icon: 'account-group',
          label: t('settings.inviteFriends'),
          color: '#FF5722',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderProfileHeader = () => (
    <Animatable.View animation="fadeInDown" delay={200}>
      <TouchableOpacity
        style={[styles.profileSection, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Avatar
          uri={user?.photoURL}
          name={user?.displayName || 'User'}
          size={60}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.profileStatus, { color: theme.colors.textSecondary }]}>
            {user?.status || 'Hey there! I am using ChatsApp'}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderSettingItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
        {item.label}
      </Text>
      {item.toggle ? (
        <TouchableOpacity
          style={[
            styles.toggle,
            item.value && styles.toggleActive,
          ]}
          onPress={item.onToggle}
        >
          <View
            style={[
              styles.toggleKnob,
              item.value && styles.toggleKnobActive,
            ]}
          />
        </TouchableOpacity>
      ) : item.value ? (
        <View style={styles.settingValue}>
          <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>
            {item.value}
          </Text>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </View>
      ) : (
        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}

        {settingsSections.map((section, sectionIndex) => (
          <Animatable.View
            key={sectionIndex}
            animation="fadeInUp"
            delay={300 + sectionIndex * 100}
            style={styles.section}
          >
            {section.title ? (
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                {section.title}
              </Text>
            ) : null}
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </Animatable.View>
        ))}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.colors.card }]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.colors.card }]}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete-forever" size={20} color="#FF3B30" />
            <Text style={styles.deleteText}>{t('settings.deleteAccount')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          ChatsApp v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileStatus: {
    fontSize: 14,
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
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
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
  bottomActions: {
    marginTop: 30,
    marginHorizontal: 15,
    gap: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 13,
  },
});

export default SettingsScreen;
