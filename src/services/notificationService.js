// src/services/notificationService.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only import native modules on mobile
let messaging, PushNotification;

if (Platform.OS !== 'web') {
  messaging = require('@react-native-firebase/messaging').default;
  PushNotification = require('react-native-push-notification').default;
}

// Export functions with platform checks
export const requestUserPermission = async () => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }
  
  try {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    
    if (enabled) {
      const token = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', token);
      console.log('FCM Token:', token);
    }
    
    return enabled;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
};

export const setupNotificationListeners = () => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return;
  }
  
  try {
    messaging().onMessage(async (remoteMessage) => {
      console.log('Message received:', remoteMessage);
      // Show local notification
      if (PushNotification) {
        PushNotification.localNotification({
          title: remoteMessage.notification?.title || 'New message',
          message: remoteMessage.notification?.body || 'You have a new message',
        });
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });
  } catch (error) {
    console.log('Notification setup error:', error);
  }
};

export const getFCMToken = async () => {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.log('Get token error:', error);
    return null;
  }
};

export const sendLocalNotification = (title, message) => {
  if (Platform.OS === 'web' || !PushNotification) {
    console.log('Local notifications not supported on web');
    return;
  }
  
  try {
    PushNotification.localNotification({
      title: title || 'ChatsApp',
      message: message || 'You have a new message!',
    });
  } catch (error) {
    console.log('Local notification error:', error);
  }
};

export default {
  requestUserPermission,
  setupNotificationListeners,
  getFCMToken,
  sendLocalNotification,
};
