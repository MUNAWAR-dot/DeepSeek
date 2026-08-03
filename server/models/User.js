const admin = require('firebase-admin');
const db = admin.firestore();

class UserModel {
  constructor() {
    this.collection = db.collection('users');
  }

  async create(userId, userData) {
    const defaultData = {
      displayName: userData.displayName || 'User',
      displayNameLower: (userData.displayName || 'user').toLowerCase(),
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      photoURL: userData.photoURL || null,
      status: 'Hey there! I am using ChatsApp',
      about: 'Available',
      online: true,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
        fontSize: 'medium',
      },
      privacy: {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        about: 'everyone',
        status: 'my_contacts',
        readReceipts: true,
        groups: 'everyone',
      },
      fcmTokens: [],
      blockedUsers: [],
      contacts: [],
    };

    await this.collection.doc(userId).set({
      ...defaultData,
      ...userData,
    });

    return this.findById(userId);
  }

  async findById(userId) {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(userId, data) {
    const updates = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (data.displayName) {
      updates.displayNameLower = data.displayName.toLowerCase();
    }

    await this.collection.doc(userId).update(updates);
    return this.findById(userId);
  }

  async delete(userId) {
    await this.collection.doc(userId).delete();
  }

  async findByPhone(phoneNumber) {
    const snapshot = await this.collection
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async search(query, limit = 20) {
    const searchLower = query.toLowerCase();
    
    const snapshot = await this.collection
      .where('displayNameLower', '>=', searchLower)
      .where('displayNameLower', '<=', searchLower + '\uf8ff')
      .limit(limit)
      .get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;
  }

  async updateOnlineStatus(userId, isOnline) {
    await this.collection.doc(userId).update({
      online: isOnline,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async addFCMToken(userId, token) {
    await this.collection.doc(userId).update({
      fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
    });
  }

  async removeFCMToken(userId, token) {
    await this.collection.doc(userId).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
    });
  }

  async blockUser(userId, blockedUserId) {
    await this.collection.doc(userId).update({
      blockedUsers: admin.firestore.FieldValue.arrayUnion(blockedUserId),
    });
  }

  async unblockUser(userId, blockedUserId) {
    await this.collection.doc(userId).update({
      blockedUsers: admin.firestore.FieldValue.arrayRemove(blockedUserId),
    });
  }

  async getBlockedUsers(userId) {
    const doc = await this.collection.doc(userId).get();
    return doc.data()?.blockedUsers || [];
  }

  async updatePrivacy(userId, privacySettings) {
    await this.collection.doc(userId).update({
      privacy: privacySettings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async syncContacts(userId, contacts) {
    await this.collection.doc(userId).update({
      contacts,
      contactsLastSynced: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

module.exports = new UserModel();
