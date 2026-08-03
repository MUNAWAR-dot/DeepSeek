const admin = require('firebase-admin');
const db = admin.firestore();

class ChatModel {
  constructor() {
    this.collection = db.collection('chats');
  }

  async create(chatData) {
    const defaultData = {
      participants: [],
      isGroup: false,
      createdBy: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      isArchived: false,
      isPinned: false,
      isMuted: false,
      mutedUntil: null,
      unreadCount: {},
    };

    const data = { ...defaultData, ...chatData };
    const docRef = await this.collection.add(data);
    return { id: docRef.id, ...data };
  }

  async findById(chatId) {
    const doc = await this.collection.doc(chatId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findByParticipants(participantIds) {
    const snapshot = await this.collection
      .where('participants', 'array-contains', participantIds[0])
      .get();

    const chats = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (
        !data.isGroup &&
        participantIds.every((id) => data.participants.includes(id))
      ) {
        chats.push({ id: doc.id, ...data });
      }
    });

    return chats[0] || null;
  }

  async getUserChats(userId, limit = 50) {
    const snapshot = await this.collection
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTime', 'desc')
      .limit(limit)
      .get();

    const chats = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });

    return chats;
  }

  async update(chatId, data) {
    const updates = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.collection.doc(chatId).update(updates);
    return this.findById(chatId);
  }

  async delete(chatId) {
    // Delete all messages
    const messagesSnapshot = await this.collection
      .doc(chatId)
      .collection('messages')
      .get();

    const batch = db.batch();
    messagesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(this.collection.doc(chatId));
    await batch.commit();
  }

  async updateLastMessage(chatId, message) {
    await this.collection.doc(chatId).update({
      lastMessage: {
        id: message.id,
        type: message.type,
        content: message.content,
        senderId: message.senderId,
      },
      lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async incrementUnreadCount(chatId, userId) {
    await this.collection.doc(chatId).update({
      [`unreadCount.${userId}`]: admin.firestore.FieldValue.increment(1),
    });
  }

  async clearUnreadCount(chatId, userId) {
    await this.collection.doc(chatId).update({
      [`unreadCount.${userId}`]: 0,
    });
  }

  async addParticipants(chatId, participantIds) {
    await this.collection.doc(chatId).update({
      participants: admin.firestore.FieldValue.arrayUnion(...participantIds),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async removeParticipant(chatId, participantId) {
    await this.collection.doc(chatId).update({
      participants: admin.firestore.FieldValue.arrayRemove(participantId),
      groupAdmins: admin.firestore.FieldValue.arrayRemove(participantId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

module.exports = new ChatModel();
