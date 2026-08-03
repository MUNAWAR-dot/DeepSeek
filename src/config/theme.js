import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from './constants';

const { COLORS, FONTS } = APP_CONSTANTS;

export const lightTheme = {
  dark: false,
  colors: {
    primary: COLORS.PRIMARY,
    primaryDark: COLORS.PRIMARY_DARK,
    primaryLight: COLORS.PRIMARY_LIGHT,
    secondary: COLORS.SECONDARY,
    secondaryDark: COLORS.SECONDARY_DARK,
    accent: COLORS.ACCENT,
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceVariant: '#E8E8E8',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: COLORS.GRAY,
    textLight: COLORS.LIGHT_GRAY,
    border: COLORS.LIGHT_GRAY,
    error: COLORS.ERROR,
    warning: COLORS.WARNING,
    success: COLORS.SUCCESS,
    info: COLORS.INFO,
    online: COLORS.ONLINE,
    offline: COLORS.OFFLINE,
    notification: COLORS.SECONDARY,
    invertedBackground: '#000000',
    invertedText: '#FFFFFF',
    statusBar: 'dark-content',
    
    // Chat specific
    chatBackground: COLORS.BACKGROUND,
    sentMessageBubble: '#DCF8C6',
    receivedMessageBubble: '#FFFFFF',
    chatInput: '#FFFFFF',
    chatHeader: COLORS.PRIMARY,
    
    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: COLORS.LIGHT_GRAY,
    tabActive: COLORS.PRIMARY,
    tabInactive: COLORS.GRAY,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: FONTS,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
  },
  elevation: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textLight: '#6E6E6E',
    border: '#2C2C2C',
    invertedBackground: '#FFFFFF',
    invertedText: '#000000',
    statusBar: 'light-content',
    
    // Chat specific
    chatBackground: '#0D0D0D',
    sentMessageBubble: '#054C44',
    receivedMessageBubble: '#1E1E1E',
    chatInput: '#1E1E1E',
    chatHeader: '#1A1A1A',
    
    // Tab bar
    tabBar: '#1E1E1E',
    tabBarBorder: '#2C2C2C',
    tabActive: COLORS.SECONDARY,
    tabInactive: '#A0A0A0',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [customTheme, setCustomTheme] = useState(null);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.THEME);
      if (stored) {
        const { isDark: storedDark } = JSON.parse(stored);
        setIsDark(storedDark);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark);
    try {
      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.THEME,
        JSON.stringify({ isDark: newDark })
      );
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = customTheme || (isDark ? darkTheme : lightTheme);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
