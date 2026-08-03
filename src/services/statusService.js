import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class StatusService {
  // Create a new status
  async createStatus(mediaUri, type = 'image', caption = '') {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const statusId = uuidv4();
      const fileName = `status_${statusId}`;
      const uploadPath = `statuses/${userId}/${fileName}`;

      // Upload media
      const reference = storage().ref(uploadPath);
      await reference.putFile(mediaUri);
      const mediaUrl = await reference.getDownloadURL();

      const statusData = {
        id: statusId,
        userId,
        type,
        mediaUrl,
        caption,
        createdAt: firestore.FieldValue.serverTimestamp(),
        expiresAt: firestore.FieldValue.serverTimestamp(), // Will be set to 24 hours
        views: [],
        viewers: {},
      };

      // Save status
      await firestore()
        .collection('statuses')
        .doc(statusId)
        .set(statusData);

      // Update user's status list
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          hasStatus: true,
          statusTimestamp: firestore.FieldValue.serverTimestamp(),
        });

      return statusData;
    } catch (error) {
      console.error('Create status failed:', error);
      throw error;
    }
  }

  // Delete a status
  async deleteStatus(statusId) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Get status data
      const statusDoc = await firestore()
        .collection('statuses')
        .doc(statusId)
        .get();

      if (!statusDoc.exists) throw new Error('Status not found');

      const statusData = statusDoc.data();

      // Check ownership
      if (statusData.userId !== userId) {
        throw new Error('Not authorized to delete this status');
      }

      // Delete media from storage
      if (statusData.mediaUrl) {
        const fileRef = storage().refFromURL(statusData.mediaUrl);
        await fileRef.delete();
      }

      // Delete status document
      await firestore().collection('statuses').doc(statusId).delete();

      // Check if user has other statuses
      const remainingStatuses = await firestore()
        .collection('statuses')
        .where('userId', '==', userId)
        .where('expiresAt', '>', firestore.FieldValue.serverTimestamp())
        .limit(1)
        .get();

      if (remainingStatuses.empty) {
        await firestore().collection('users').doc(userId).update({
          hasStatus: false,
        });
      }
    } catch (error) {
      console.error('Delete status failed:', error);
      throw error;
    }
  }

  // Get statuses for feed
  async getStatusFeed() {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Get user's contacts
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const contacts = userData?.contacts || [];
      const blockedUsers = userData?.blockedUsers || [];

      // Get all contacts' IDs
      const contactIds = contacts
        .filter((c) => c.isAppUser && !blockedUsers.includes(c.appUserId))
        .map((c) => c.appUserId);

      // Add self to view own status
      contactIds.push(userId);

      if (contactIds.length === 0) return [];

      // Get active statuses from contacts (not expired)
      const now = firestore.FieldValue.serverTimestamp();
      
      // Firestore 'in' query supports max 10 values
      const batches = [];
      for (let i = 0; i < contactIds.length; i += 10) {
        batches.push(contactIds.slice(i, i + 10));
      }

      const allStatuses = [];
      
      for (const batch of batches) {
        const snapshot = await firestore()
          .collection('statuses')
          .where('userId', 'in', batch)
          .where('expiresAt', '>', firestore.Timestamp.now())
          .orderBy('expiresAt', 'desc')
          .orderBy('createdAt', 'desc')
          .get();

        snapshot.forEach((doc) => {
          allStatuses.push({ id: doc.id, ...doc.data() });
        });
      }

      // Group statuses by user
      const groupedStatuses = {};
      
      allStatuses.forEach((status) => {
        if (!groupedStatuses[status.userId]) {
          groupedStatuses[status.userId] = {
            userId: status.userId,
            statuses: [],
            latestTimestamp: status.createdAt,
          };
        }
        groupedStatuses[status.userId].statuses.push(status);
        if (status.createdAt > groupedStatuses[status.userId].latestTimestamp) {
          groupedStatuses[status.userId].latestTimestamp = status.createdAt;
        }
      });

      // Sort by latest timestamp
      const sortedStatuses = Object.values(groupedStatuses).sort(
        (a, b) => b.latestTimestamp?.toMillis() - a.latestTimestamp?.toMillis()
      );

      return sortedStatuses;
    } catch (error) {
      console.error('Get status feed failed:', error);
      throw error;
    }
  }

  // View a status
  async viewStatus(statusId) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const statusRef = firestore().collection('statuses').doc(statusId);
      
      await statusRef.update({
        viewers: firestore.FieldValue.arrayUnion({
          userId,
          viewedAt: firestore.FieldValue.serverTimestamp(),
        }),
      });
    } catch (error) {
      console.error('View status failed:', error);
      throw error;
    }
  }

  // Get status viewers
  async getStatusViewers(statusId) {
    try {
      const doc = await firestore().collection('statuses').doc(statusId).get();
      if (doc.exists) {
        const viewers = doc.data()?.viewers || [];
        return viewers;
      }
      return [];
    } catch (error) {
      console.error('Get status viewers failed:', error);
      throw error;
    }
  }

  // Get my statuses
  async getMyStatuses() {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const snapshot = await firestore()
        .collection('statuses')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const statuses = [];
      snapshot.forEach((doc) => {
        statuses.push({ id: doc.id, ...doc.data() });
      });

      return statuses;
    } catch (error) {
      console.error('Get my statuses failed:', error);
      throw error;
    }
  }

  // Subscribe to status feed
  subscribeToStatusFeed(callback) {
    const userId = auth().currentUser?.uid;
    if (!userId) return () => {};

    // This is a simplified version. In production, you might want to use
    // a more efficient approach with cloud functions for cleanup
    return firestore()
      .collection('statuses')
      .where('expiresAt', '>', firestore.Timestamp.now())
      .onSnapshot(
        async (snapshot) => {
          const statuses = [];
          snapshot.forEach((doc) => {
            statuses.push({ id: doc.id, ...doc.data() });
          });
          callback(statuses);
        },
        (error) => {
          console.error('Status feed subscription error:', error);
          callback([]);
        }
      );
  }
}

export default new StatusService();
