import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../config/theme';
import { APP_CONSTANTS } from '../../config/constants';

const AboutScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ChatsApp - a modern messaging app! Download it now!`,
        title: 'ChatsApp',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRateApp = () => {
    // Open app store
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/chatsapp/id123456789'
      : 'https://play.google.com/store/apps/details?id=com.chatsapp.messenger';
    Linking.openURL(url);
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:support@chatsapp.com');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://chatsapp.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://chatsapp.com/terms');
  };

  const handleLicenses = () => {
    // Show open source licenses
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="chat" size={50} color="#fff" />
            </View>
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            ChatsApp
          </Text>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
            Version {APP_CONSTANTS.APP_VERSION}
          </Text>
        </Animatable.View>

        {/* Description */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            ChatsApp is a modern messaging application that allows you to connect with friends
            and family worldwide. Send messages, make calls, share media, and stay connected
            with end-to-end encryption.
          </Text>
        </Animatable.View>

        {/* Actions */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Icon name="share-variant" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Share ChatsApp
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRateApp}>
              <Icon name="star" size={24} color="#FFD700" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Rate ChatsApp
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
              <Icon name="email" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Contact Us
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Legal */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <Icon name="shield-check" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Privacy Policy
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleTermsOfService}>
              <Icon name="file-document" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Terms of Service
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLicenses}>
              <Icon name="license" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                Open Source Licenses
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Copyright */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.copyright}>
          <Text style={[styles.copyrightText, { color: theme.colors.textSecondary }]}>
            © 2024 ChatsApp Inc. All rights reserved.
          </Text>
          <Text style={[styles.copyrightText, { color: theme.colors.textSecondary }]}>
            Made with ❤️
          </Text>
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  copyrightText: {
    fontSize: 13,
    marginBottom: 4,
  },
});

export default AboutScreen;
