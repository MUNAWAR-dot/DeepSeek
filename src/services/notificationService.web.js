// src/services/notificationService.web.js
// Web stub - notifications not supported on web

export const requestUserPermission = async () => {
  console.log('Notifications not supported on web');
  return false;
};

export const setupNotificationListeners = () => {
  console.log('Notifications not supported on web');
};

export const getFCMToken = async () => {
  console.log('FCM not supported on web');
  return null;
};

export const sendLocalNotification = () => {
  console.log('Local notifications not supported on web');
};

export default {
  requestUserPermission,
  setupNotificationListeners,
  getFCMToken,
  sendLocalNotification,
};
