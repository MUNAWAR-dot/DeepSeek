import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../config/constants';

class NotificationService {
  constructor() {
    this.lastNotificationId = 0;
  }

  // Configure push notifications
  async configure() {
    try {
      // Configure channel for Android
      if (Platform.OS === 'android') {
        PushNotification.createChannel(
          {
            channelId: 'chatsapp-messages',
            channelName: 'Messages',
            channelDescription: 'Notifications for new messages',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => console.log(`Channel created: ${created}`)
        );

        PushNotification.createChannel({
          channelId: 'chatsapp-calls',
          channelName: 'Calls',
          channelDescription: 'Notifications for incoming calls',
          playSound: true,
          soundName: 'call_ringtone.mp3',
          importance: 5,
          vibrate: true,
        });

        PushNotification.createChannel({
          channelId: 'chatsapp-groups',
          channelName: 'Groups',
          channelDescription: 'Notifications for group activities',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        });
      }

      // Configure push notification
      PushNotification.configure({
        onRegister: async (token) => {
          console.log('Notification token:', token);
          await AsyncStorage.setItem(
            APP_CONSTANTS.STORAGE_KEYS.FCM_TOKEN,
            token.token
          );
        },

        onNotification: (notification) => {
          console.log('Notification received:', notification);
          
          // Handle notification tap
          if (notification.userInteraction) {
            this.handleNotificationTap(notification);
          }

          // Required for iOS
          if (Platform.OS === 'ios') {
            notification.finish('backgroundFetchResultNoData');
          }
        },

        // Android only
        senderID: process.env.FIREBASE_MESSAGING_SENDER_ID,

        // iOS only
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });

      // Handle FCM messages
      this.setupFCMHandlers();

      return true;
    } catch (error) {
      console.error('Configure notifications failed:', error);
      throw error;
    }
  }

  // Setup FCM message handlers
  setupFCMHandlers() {
    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Handle notification open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          // Handle after a delay to ensure navigation is ready
          setTimeout(() => {
            this.handleNotificationTap(remoteMessage);
          }, 1000);
        }
      });
  }

  // Show local notification
  showLocalNotification(remoteMessage) {
    const { data, notification } = remoteMessage;
    const notificationId = ++this.lastNotificationId;

    let channelId = 'chatsapp-messages';
    let title = notification?.title || 'New Message';
    let message = notification?.body || '';
    let soundName = 'default';

    // Determine notification type and channel
    switch (data?.type) {
      case 'message':
        channelId = 'chatsapp-messages';
        break;
      case 'call':
        channelId = 'chatsapp-calls';
        title = 'Incoming Call';
        soundName = 'call_ringtone.mp3';
        break;
      case 'group':
        channelId = 'chatsapp-groups';
        break;
      default:
        channelId = 'chatsapp-messages';
    }

    PushNotification.localNotification({
      channelId,
      id: notificationId,
      title,
      message,
      bigText: message,
      subText: data?.senderName || '',
      userInfo: data,
      playSound: true,
      soundName,
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
      actions: data?.actions || undefined,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: '#075E54',
      when: new Date().getTime(),
      showWhen: true,
      autoCancel: true,
    });
  }

  // Show incoming call notification
  showIncomingCallNotification(callData) {
    const notificationId = ++this.lastNotificationId;

    PushNotification.localNotification({
      channelId: 'chatsapp-calls',
      id: notificationId,
      title: callData.callerName || 'Incoming Call',
      message: callData.type === 'video' ? 'Video Call' : 'Voice Call',
      userInfo: {
        type: 'call',
        callId: callData.id,
        callerId: callData.callerId,
        callType: callData.type,
      },
      playSound: true,
      soundName: 'call_ringtone.mp3',
      importance: 'high',
      priority: 'high',
      ongoing: true,
      vibrate: true,
      vibration: 1000,
      autoCancel: false,
      actions: ['Accept', 'Reject'],
      invokeApp: true,
    });
  }

  // Cancel call notification
  cancelCallNotification(notificationId) {
    PushNotification.cancelLocalNotifications({ id: notificationId.toString() });
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    const data = notification?.data || notification?.userInfo;
    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'message':
        this.navigateToChat(data.chatId);
        break;
      case 'call':
        this.navigateToCall(data);
        break;
      case 'group':
        this.navigateToChat(data.chatId);
        break;
      case 'status':
        this.navigateToStatus(data.userId);
        break;
      default:
        break;
    }
  }

  // Navigation helpers
  navigateToChat(chatId) {
    // Use navigation ref to navigate
    if (global.navigationRef?.isReady()) {
      global.navigationRef.navigate('ChatRoom', { chatId });
    }
  }

  navigateToCall(callData) {
    if (global.navigationRef?.isReady()) {
      global.navigationRef.navigate('CallScreen', callData);
    }
  }

  navigateToStatus(userId) {
    if (global.navigationRef?.isReady()) {
      global.navigationRef.navigate('StatusView', { userId });
    }
  }

  // Update badge count
  updateBadgeCount(count) {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  }

  // Clear all notifications
  clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  // Clear notifications for a specific chat
  clearChatNotifications(chatId) {
    // Cancel notifications with matching chatId in userInfo
    PushNotification.getScheduledLocalNotifications((notifications) => {
      notifications.forEach((notification) => {
        if (notification.userInfo?.chatId === chatId) {
          PushNotification.cancelLocalNotifications({
            id: notification.id.toString(),
          });
        }
      });
    });
  }

  // Request permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
      }
      return true; // Android permissions handled in manifest
    } catch (error) {
      console.error('Request notification permissions failed:', error);
      return false;
    }
  }

  // Schedule a local notification
  scheduleLocalNotification(title, message, date, data = {}) {
    PushNotification.localNotificationSchedule({
      channelId: 'chatsapp-messages',
      title,
      message,
      date,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }
}

export default new NotificationService();
