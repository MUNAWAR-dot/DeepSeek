const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');

class MessageModel {
  constructor() {
    this.collection = db.collection('chats');
  }

  getMessagesRef(chatId) {
    return this.collection.doc(chatId).collection('messages');
  }

  async create(chatId, messageData) {
    const messageId = messageData.id || uuidv4();
    
    const message = {
      id: messageId,
      chatId,
      senderId: messageData.senderId,
      type: messageData.type || 'text',
      content: messageData.content || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      reactions: {},
      isForwarded: false,
      ...messageData,
    };

    await this.getMessagesRef(chatId).doc(messageId).set(message);
    return message;
  }

  async findById(chatId, messageId) {
    const doc = await this.getMessagesRef(chatId).doc(messageId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getMessages(chatId, options = {}) {
    const { limit = 50, before } = options;

    let query = this.getMessagesRef(chatId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (before) {
      const beforeDate = admin.firestore.Timestamp.fromDate(new Date(before));
      query = query.startAfter(beforeDate);
    }

    const snapshot = await query.get();

    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
  }

  async update(chatId, messageId, data) {
    await this.getMessagesRef(chatId).doc(messageId).update(data);
    return this.findById(chatId, messageId);
  }

  async delete(chatId, messageId) {
    await this.getMessagesRef(chatId).doc(messageId).delete();
  }

  async markAsRead(chatId, messageIds) {
    const batch = db.batch();
    const messagesRef = this.getMessagesRef(chatId);

    messageIds.forEach((messageId) => {
      batch.update(messagesRef.doc(messageId), {
        status: 'read',
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async addReaction(chatId, messageId, userId, reaction) {
    await this.getMessagesRef(chatId).doc(messageId).update({
      [`reactions.${userId}`]: reaction,
    });
  }

  async removeReaction(chatId, messageId, userId) {
    await this.getMessagesRef(chatId).doc(messageId).update({
      [`reactions.${userId}`]: admin.firestore.FieldValue.delete(),
    });
  }

  async getMediaMessages(chatId, type = null, limit = 50) {
    let query = this.getMessagesRef(chatId)
      .where('type', 'in', ['image', 'video', 'audio', 'document'])
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();

    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
  }
}

module.exports = new MessageModel();
