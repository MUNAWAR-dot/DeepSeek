import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../config/theme';

const EmptyState = ({
  icon = 'information-outline',
  title = 'Nothing here',
  subtitle = '',
  actionText = '',
  onAction,
  iconSize = 80,
  iconColor,
}) => {
  const { theme } = useTheme();
  const color = iconColor || theme.colors.textSecondary;

  return (
    <Animatable.View animation="fadeIn" delay={300} style={styles.container}>
      <Animatable.View animation="bounceIn" delay={500}>
        <Icon name={icon} size={iconSize} color={color} />
      </Animatable.View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}

      {actionText && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
