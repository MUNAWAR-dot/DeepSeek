import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { uploadFile } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../config/constants';

class UserService {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, data) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  // Upload and update profile photo
  async updateProfilePhoto(userId, imageUri) {
    try {
      const uploadPath = `users/${userId}/profile_photo.jpg`;
      const photoURL = await uploadFile(imageUri, uploadPath);

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          photoURL,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Update auth profile
      await auth().currentUser?.updateProfile({
        photoURL,
      });

      return photoURL;
    } catch (error) {
      console.error('Update profile photo failed:', error);
      throw error;
    }
  }

  // Update user status
  async updateStatus(userId, status) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          status,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update status failed:', error);
      throw error;
    }
  }

  // Update last seen
  async updateLastSeen(userId) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update last seen failed:', error);
    }
  }

  // Set user online status
  async setOnlineStatus(userId, isOnline) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          online: isOnline,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Set online status failed:', error);
    }
  }

  // Search users
  async searchUsers(query, limit = 20) {
    try {
      if (!query || query.length < 2) return [];

      const searchTerm = query.toLowerCase();
      
      // Search by display name
      const nameSnapshot = await firestore()
        .collection('users')
        .where('displayNameLower', '>=', searchTerm)
        .where('displayNameLower', '<=', searchTerm + '\uf8ff')
        .limit(limit)
        .get();

      // Search by phone number
      const phoneSnapshot = await firestore()
        .collection('users')
        .where('phoneNumber', '>=', query)
        .where('phoneNumber', '<=', query + '\uf8ff')
        .limit(limit)
        .get();

      const users = new Map();

      nameSnapshot.forEach((doc) => {
        users.set(doc.id, { id: doc.id, ...doc.data() });
      });

      phoneSnapshot.forEach((doc) => {
        users.set(doc.id, { id: doc.id, ...doc.data() });
      });

      return Array.from(users.values()).slice(0, limit);
    } catch (error) {
      console.error('Search users failed:', error);
      throw error;
    }
  }

  // Get user's contacts from phone
  async getPhoneContacts() {
    try {
      const Contacts = require('react-native-contacts').default;
      const permission = await Contacts.requestPermission();
      
      if (permission !== 'authorized') {
        throw new Error('Contacts permission denied');
      }

      const contacts = await Contacts.getAll();
      const phoneNumbers = [];

      contacts.forEach((contact) => {
        contact.phoneNumbers.forEach((phone) => {
          const cleanedNumber = phone.number.replace(/[\s\-()]/g, '');
          if (cleanedNumber) {
            phoneNumbers.push({
              name: contact.displayName || contact.givenName,
              phoneNumber: cleanedNumber,
              hasThumbnail: contact.hasThumbnail,
              thumbnailPath: contact.thumbnailPath,
            });
          }
        });
      });

      return phoneNumbers;
    } catch (error) {
      console.error('Get phone contacts failed:', error);
      throw error;
    }
  }

  // Find users by phone numbers (to find which contacts are on ChatsApp)
  async findUsersByPhone(phoneNumbers) {
    try {
      if (!phoneNumbers || phoneNumbers.length === 0) return [];

      // Firestore supports max 10 values in 'in' query
      const batches = [];
      for (let i = 0; i < phoneNumbers.length; i += 10) {
        batches.push(phoneNumbers.slice(i, i + 10));
      }

      const results = [];
      
      for (const batch of batches) {
        const snapshot = await firestore()
          .collection('users')
          .where('phoneNumber', 'in', batch)
          .get();

        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      }

      return results;
    } catch (error) {
      console.error('Find users by phone failed:', error);
      throw error;
    }
  }

  // Sync contacts with server
  async syncContacts(contacts) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const phoneNumbers = contacts.map((c) => c.phoneNumber);
      const appUsers = await this.findUsersByPhone(phoneNumbers);

      // Save synced contacts to Firestore
      const syncedContacts = contacts.map((contact) => {
        const appUser = appUsers.find(
          (u) => u.phoneNumber === contact.phoneNumber
        );
        return {
          ...contact,
          appUserId: appUser?.id || null,
          isAppUser: !!appUser,
        };
      });

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          syncedContacts,
          contactsLastSynced: firestore.FieldValue.serverTimestamp(),
        });

      return syncedContacts;
    } catch (error) {
      console.error('Sync contacts failed:', error);
      throw error;
    }
  }

  // Block user
  async blockUser(userIdToBlock) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          blockedUsers: firestore.FieldValue.arrayUnion(userIdToBlock),
        });
    } catch (error) {
      console.error('Block user failed:', error);
      throw error;
    }
  }

  // Unblock user
  async unblockUser(userIdToUnblock) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          blockedUsers: firestore.FieldValue.arrayRemove(userIdToUnblock),
        });
    } catch (error) {
      console.error('Unblock user failed:', error);
      throw error;
    }
  }

  // Get blocked users list
  async getBlockedUsers() {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const doc = await firestore().collection('users').doc(userId).get();
      const blockedUsers = doc.data()?.blockedUsers || [];

      // Fetch blocked users details
      const users = [];
      for (const blockedId of blockedUsers) {
        const userDoc = await firestore()
          .collection('users')
          .doc(blockedId)
          .get();
        if (userDoc.exists) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
      }

      return users;
    } catch (error) {
      console.error('Get blocked users failed:', error);
      throw error;
    }
  }

  // Report user
  async reportUser(userIdToReport, reason, description = '') {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await firestore().collection('reports').add({
        reportedBy: userId,
        reportedUser: userIdToReport,
        reason,
        description,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Report user failed:', error);
      throw error;
    }
  }

  // Update privacy settings
  async updatePrivacySettings(userId, privacySettings) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          privacy: privacySettings,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update privacy settings failed:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settings) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          'settings.notifications': settings,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update notification settings failed:', error);
      throw error;
    }
  }

  // Update app settings
  async updateAppSettings(userId, settings) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          settings: settings,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update app settings failed:', error);
      throw error;
    }
  }

  // Delete account
  async deleteAccount(userId) {
    try {
      // Delete user data from Firestore
      await firestore().collection('users').doc(userId).delete();

      // Delete user's chats
      const chatsSnapshot = await firestore()
        .collection('chats')
        .where('participants', 'array-contains', userId)
        .get();

      const batch = firestore().batch();
      chatsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete auth account
      await auth().currentUser?.delete();

      // Clear local storage
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    }
  }

  // Get user's online status
  async getUserOnlineStatus(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      if (doc.exists) {
        return {
          online: doc.data()?.online || false,
          lastSeen: doc.data()?.lastSeen?.toDate() || null,
        };
      }
      return { online: false, lastSeen: null };
    } catch (error) {
      console.error('Get user online status failed:', error);
      return { online: false, lastSeen: null };
    }
  }

  // Subscribe to user's online status
  subscribeToUserStatus(userId, callback) {
    return firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              online: doc.data()?.online || false,
              lastSeen: doc.data()?.lastSeen?.toDate() || null,
            });
          }
        },
        (error) => {
          console.error('Subscribe to user status failed:', error);
        }
      );
  }
}

export default new UserService();
