import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';

const SafeAreaWrapper = ({
  children,
  edges = ['top', 'bottom'],
  statusBarStyle = 'dark-content',
  statusBarColor,
  style,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const barColor = statusBarColor || (isDark ? '#121212' : '#FFFFFF');
  const barStyle = statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: theme.colors.background }, style]}
      {...props}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={barColor}
        translucent={false}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
