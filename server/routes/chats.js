const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');

const db = admin.firestore();

// Get all chats for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const snapshot = await db
      .collection('chats')
      .where('participants', 'array-contains', req.userId)
      .orderBy('lastMessageTime', 'desc')
      .limit(limit)
      .get();

    const chats = [];
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chat
router.get('/:chatId', authenticateUser, async (req, res) => {
  try {
    const chatDoc = await db.collection('chats').doc(req.params.chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = chatDoc.data();

    // Check if user is participant
    if (!chatData.participants?.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a participant of this chat' });
    }

    res.json({ id: chatDoc.id, ...chatData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create chat
router.post(
  '/create',
  authenticateUser,
  [
    body('participants').isArray({ min: 1 }),
    body('isGroup').optional().isBoolean(),
    body('groupName').optional().isString(),
    body('groupDescription').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { participants, isGroup = false, groupName, groupDescription } = req.body;
      
      // Ensure current user is included
      const allParticipants = [...new Set([req.userId, ...participants])];

      // Check if all participants exist
      for (const participantId of allParticipants) {
        const userDoc = await db.collection('users').doc(participantId).get();
        if (!userDoc.exists) {
          return res.status(400).json({ error: `User ${participantId} not found` });
        }
      }

      const chatData = {
        participants: allParticipants,
        isGroup,
        createdBy: req.userId,
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

      if (isGroup) {
        chatData.groupName = groupName || 'New Group';
        chatData.groupDescription = groupDescription || '';
        chatData.groupIcon = null;
        chatData.groupAdmins = [req.userId];
        chatData.participantDetails = allParticipants.map((id) => ({
          userId: id,
          isAdmin: id === req.userId,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        }));
      }

      // Initialize unread count
      allParticipants.forEach((id) => {
        if (id !== req.userId) {
          chatData.unreadCount[id] = 0;
        }
      });

      const chatRef = await db.collection('chats').add(chatData);
      const newChat = { id: chatRef.id, ...chatData };

      // Emit via socket if available
      if (req.app.get('io')) {
        allParticipants.forEach((participantId) => {
          if (participantId !== req.userId) {
            req.app.get('io').to(participantId).emit('chat:new', newChat);
          }
        });
      }

      res.status(201).json(newChat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update chat settings
router.put(
  '/:chatId/update',
  authenticateUser,
  [
    body('isArchived').optional().isBoolean(),
    body('isPinned').optional().isBoolean(),
    body('isMuted').optional().isBoolean(),
    body('mutedUntil').optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const chatRef = db.collection('chats').doc(req.params.chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      const chatData = chatDoc.data();
      if (!chatData.participants?.includes(req.userId)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updates = {};
      const allowedUpdates = ['isArchived', 'isPinned', 'isMuted', 'mutedUntil'];
      
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await chatRef.update(updates);

      res.json({ message: 'Chat updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete chat
router.delete('/:chatId/delete', authenticateUser, async (req, res) => {
  try {
    const chatRef = db.collection('chats').doc(req.params.chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants?.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete all messages
    const messagesSnapshot = await chatRef.collection('messages').get();
    const batch = db.batch();
    
    messagesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(chatRef);
    await batch.commit();

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add participants to group
router.post(
  '/:chatId/participants/add',
  authenticateUser,
  [body('participants').isArray({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const chatRef = db.collection('chats').doc(req.params.chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      const chatData = chatDoc.data();
      
      if (!chatData.isGroup) {
        return res.status(400).json({ error: 'Not a group chat' });
      }

      if (!chatData.groupAdmins?.includes(req.userId)) {
        return res.status(403).json({ error: 'Only admins can add participants' });
      }

      const { participants } = req.body;
      const currentParticipants = chatData.participants || [];
      const newParticipants = [...new Set([...currentParticipants, ...participants])];

      if (newParticipants.length > 256) {
        return res.status(400).json({ error: 'Maximum 256 participants allowed' });
      }

      const participantDetails = chatData.participantDetails || [];
      const newParticipantDetails = participants.map((id) => ({
        userId: id,
        isAdmin: false,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        addedBy: req.userId,
      }));

      await chatRef.update({
        participants: newParticipants,
        participantDetails: [...participantDetails, ...newParticipantDetails],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ message: 'Participants added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove participant from group
router.delete(
  '/:chatId/participants/remove/:participantId',
  authenticateUser,
  async (req, res) => {
    try {
      const chatRef = db.collection('chats').doc(req.params.chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      const chatData = chatDoc.data();
      
      if (!chatData.isGroup) {
        return res.status(400).json({ error: 'Not a group chat' });
      }

      if (!chatData.groupAdmins?.includes(req.userId)) {
        return res.status(403).json({ error: 'Only admins can remove participants' });
      }

      const currentParticipants = chatData.participants || [];
      const updatedParticipants = currentParticipants.filter(
        (id) => id !== req.params.participantId
      );

      const participantDetails = (chatData.participantDetails || []).filter(
        (p) => p.userId !== req.params.participantId
      );

      await chatRef.update({
        participants: updatedParticipants,
        participantDetails,
        groupAdmins: (chatData.groupAdmins || []).filter(
          (id) => id !== req.params.participantId
        ),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ message: 'Participant removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Leave group
router.post('/:chatId/leave', authenticateUser, async (req, res) => {
  try {
    const chatRef = db.collection('chats').doc(req.params.chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    
    if (!chatData.isGroup) {
      return res.status(400).json({ error: 'Not a group chat' });
    }

    const currentParticipants = chatData.participants || [];
    const updatedParticipants = currentParticipants.filter(
      (id) => id !== req.userId
    );

    const participantDetails = (chatData.participantDetails || []).filter(
      (p) => p.userId !== req.userId
    );

    await chatRef.update({
      participants: updatedParticipants,
      participantDetails,
      groupAdmins: (chatData.groupAdmins || []).filter(
        (id) => id !== req.userId
      ),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
