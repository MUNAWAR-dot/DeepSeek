import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../config/theme';

const Header = ({
  title,
  subtitle,
  leftIcon = 'arrow-left',
  onLeftPress,
  rightIcon,
  onRightPress,
  rightComponent,
  transparent = false,
  gradient = true,
  children,
  style,
}) => {
  const { theme } = useTheme();

  const renderContent = () => (
    <View style={[styles.container, style]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={transparent ? 'transparent' : theme.colors.primary}
        translucent={transparent}
      />

      <View style={styles.content}>
        {/* Left */}
        <View style={styles.left}>
          {onLeftPress && leftIcon && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              <Icon name={leftIcon} size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={styles.right}>
          {rightComponent ? (
            rightComponent
          ) : rightIcon && onRightPress ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <Icon name={rightIcon} size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {children}
    </View>
  );

  if (gradient && !transparent) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.gradient}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.headerBackground, { backgroundColor: transparent ? 'transparent' : theme.colors.primary }]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerBackground: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  left: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
  },
});

export default Header;
