import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useStore from '../../store/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = () => {
  const { toast, hideToast } = useStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      showToast();
    } else {
      hideToastAnimation();
    }
  }, [toast]);

  const showToast = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
      hideToast();
    }, 3000);

    return () => clearTimeout(timer);
  };

  const hideToastAnimation = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
      default:
        return 'information';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Icon name={getIcon()} size={24} color="#fff" />
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
      {toast.action && (
        <TouchableOpacity onPress={toast.action.onPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{toast.action.label}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Icon name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
    gap: 10,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;
