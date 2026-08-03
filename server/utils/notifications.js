const admin = require('firebase-admin');

class NotificationService {
  constructor() {
    this.messaging = admin.messaging();
  }

  async sendToUser(userId, notification, data = {}) {
    try {
      // Get user's FCM tokens
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.data();
      const fcmTokens = userData?.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log(`No FCM tokens for user ${userId}`);
        return;
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        tokens: fcmTokens,
      };

      const response = await this.messaging.sendMulticast(message);
      console.log(`Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(fcmTokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
            });
        }
      }

      return response;
    } catch (error) {
      console.error('Send notification failed:', error);
      throw error;
    }
  }

  async sendToMultipleUsers(userIds, notification, data = {}) {
    const promises = userIds.map((userId) =>
      this.sendToUser(userId, notification, data)
    );
    return Promise.all(promises);
  }

  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data,
        topic,
      };

      const response = await this.messaging.send(message);
      return response;
    } catch (error) {
      console.error('Send to topic failed:', error);
      throw error;
    }
  }

  async subscribeToTopic(userId, topic) {
    try {
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      const tokens = userDoc.data()?.fcmTokens || [];
      
      if (tokens.length > 0) {
        await this.messaging.subscribeToTopic(tokens, topic);
      }
    } catch (error) {
      console.error('Subscribe to topic failed:', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(userId, topic) {
    try {
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      const tokens = userDoc.data()?.fcmTokens || [];
      
      if (tokens.length > 0) {
        await this.messaging.unsubscribeFromTopic(tokens, topic);
      }
    } catch (error) {
      console.error('Unsubscribe from topic failed:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
