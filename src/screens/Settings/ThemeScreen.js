import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../config/theme';

const ThemeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Theme
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.content}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme.colors.card },
            !isDark && styles.selectedOption,
          ]}
          onPress={() => isDark && toggleTheme()}
        >
          <View style={styles.themeInfo}>
            <View style={[styles.themePreview, styles.lightPreview]}>
              <Icon name="white-balance-sunny" size={30} color="#FF9800" />
            </View>
            <View>
              <Text style={[styles.themeName, { color: theme.colors.text }]}>
                Light Mode
              </Text>
              <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
                Classic bright theme
              </Text>
            </View>
          </View>
          {!isDark && <Icon name="check" size={24} color="#25D366" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme.colors.card },
            isDark && styles.selectedOption,
          ]}
          onPress={() => !isDark && toggleTheme()}
        >
          <View style={styles.themeInfo}>
            <View style={[styles.themePreview, styles.darkPreview]}>
              <Icon name="moon-waning-crescent" size={30} color="#FFD700" />
            </View>
            <View>
              <Text style={[styles.themeName, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
                Easy on the eyes, saves battery
              </Text>
            </View>
          </View>
          {isDark && <Icon name="check" size={24} color="#25D366" />}
        </TouchableOpacity>
      </Animatable.View>
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
  content: {
    padding: 20,
    gap: 15,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#25D366',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightPreview: {
    backgroundColor: '#FFF8E1',
  },
  darkPreview: {
    backgroundColor: '#1A1A1A',
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
});

export default ThemeScreen;
