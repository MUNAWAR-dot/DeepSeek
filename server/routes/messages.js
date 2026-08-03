const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');

const db = admin.firestore();

// Get messages for a chat
router.get('/:chatId', authenticateUser, async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // Timestamp for pagination

    // Check if user is participant
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants?.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let query = db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (before) {
      query = query.startAfter(admin.firestore.Timestamp.fromDate(new Date(before)));
    }

    const snapshot = await query.get();

    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post(
  '/send',
  authenticateUser,
  [
    body('chatId').isString(),
    body('type').isString().isIn(['text', 'image', 'video', 'audio', 'document', 'location', 'contact']),
    body('content').isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { chatId, type, content, replyTo, fileUrl, fileName, fileSize } = req.body;
      const messageId = req.body.id || require('uuid').v4();

      // Check if user is participant
      const chatDoc = await db.collection('chats').doc(chatId).get();
      if (!chatDoc.exists) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      const chatData = chatDoc.data();
      if (!chatData.participants?.includes(req.userId)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const messageData = {
        id: messageId,
        chatId,
        senderId: req.userId,
        type,
        content,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        reactions: {},
        isForwarded: false,
      };

      if (replyTo) messageData.replyTo = replyTo;
      if (fileUrl) messageData.fileUrl = fileUrl;
      if (fileName) messageData.fileName = fileName;
      if (fileSize) messageData.fileSize = fileSize;

      // Save message
      await db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await db.collection('chats').doc(chatId).update({
        lastMessage: {
          id: messageId,
          type,
          content: content?.substring(0, 100) || `${type} message`,
          senderId: req.userId,
        },
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update unread count for other participants
      chatData.participants.forEach(async (participantId) => {
        if (participantId !== req.userId) {
          await db
            .collection('chats')
            .doc(chatId)
            .update({
              [`unreadCount.${participantId}`]: admin.firestore.FieldValue.increment(1),
            });
        }
      });

      res.status(201).json(messageData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete message
router.delete('/:messageId/delete', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { chatId, deleteForEveryone } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const messageRef = db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const messageData = messageDoc.data();

    if (messageData.senderId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    if (deleteForEveryone) {
      await messageRef.delete();
    } else {
      await messageRef.update({
        [`deletedFor.${req.userId}`]: true,
      });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit message
router.put('/:messageId/edit', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ error: 'chatId and content are required' });
    }

    const messageRef = db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const messageData = messageDoc.data();

    if (messageData.senderId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    if (messageData.type !== 'text') {
      return res.status(400).json({ error: 'Only text messages can be edited' });
    }

    await messageRef.update({
      content,
      edited: true,
      editedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Message edited successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forward message
router.post('/forward', authenticateUser, async (req, res) => {
  try {
    const { sourceChatId, messageId, targetChatIds } = req.body;

    if (!sourceChatId || !messageId || !targetChatIds?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get original message
    const messageDoc = await db
      .collection('chats')
      .doc(sourceChatId)
      .collection('messages')
      .doc(messageId)
      .get();

    if (!messageDoc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const originalMessage = messageDoc.data();
    const { v4: uuidv4 } = require('uuid');

    // Forward to each target chat
    const forwardResults = await Promise.all(
      targetChatIds.map(async (chatId) => {
        const newMessageId = uuidv4();
        const newMessage = {
          ...originalMessage,
          id: newMessageId,
          chatId,
          senderId: req.userId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: 'sent',
          isForwarded: true,
          originalSenderId: originalMessage.senderId,
          reactions: {},
          replyTo: null,
        };

        await db
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(newMessageId)
          .set(newMessage);

        await db.collection('chats').doc(chatId).update({
          lastMessage: {
            id: newMessageId,
            type: newMessage.type,
            content: newMessage.content?.substring(0, 100) || 'Forwarded message',
            senderId: req.userId,
          },
          lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { chatId, messageId: newMessageId };
      })
    );

    res.json(forwardResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.post('/read', authenticateUser, async (req, res) => {
  try {
    const { chatId, messageIds } = req.body;

    if (!chatId || !messageIds?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const batch = db.batch();

    messageIds.forEach((messageId) => {
      const messageRef = db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId);
      batch.update(messageRef, {
        status: 'read',
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    // Clear unread count
    await db
      .collection('chats')
      .doc(chatId)
      .update({
        [`unreadCount.${req.userId}`]: 0,
      });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat media
router.get('/:chatId/media', authenticateUser, async (req, res) => {
  try {
    const { chatId } = req.params;
    const type = req.query.type;
    const limit = parseInt(req.query.limit) || 50;

    let query = db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .where('type', 'in', ['image', 'video', 'audio', 'document'])
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();

    const media = [];
    snapshot.forEach((doc) => {
      media.push({ id: doc.id, ...doc.data() });
    });

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
