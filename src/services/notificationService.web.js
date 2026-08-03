// src/services/notificationService.web.js
export const requestUserPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendLocalNotification = (title, message) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
    });
  }
};

export default {
  requestUserPermission,
  sendLocalNotification,
};
