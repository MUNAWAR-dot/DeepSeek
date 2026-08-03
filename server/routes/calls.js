const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const db = admin.firestore();

// Get call history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const snapshot = await db
      .collection('calls')
      .where('participants', 'array-contains', req.userId)
      .orderBy('startTime', 'desc')
      .limit(limit)
      .get();

    const calls = [];
    snapshot.forEach((doc) => {
      calls.push({ id: doc.id, ...doc.data() });
    });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate call
router.post(
  '/initiate',
  authenticateUser,
  [
    body('receiverId').isString(),
    body('type').isString().isIn(['voice', 'video']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { receiverId, type } = req.body;
      const callId = require('uuid').v4();

      // Check if receiver exists
      const receiverDoc = await db.collection('users').doc(receiverId).get();
      if (!receiverDoc.exists) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      // Check if receiver is blocked
      const userDoc = await db.collection('users').doc(req.userId).get();
      const blockedUsers = userDoc.data()?.blockedUsers || [];
      if (blockedUsers.includes(receiverId)) {
        return res.status(403).json({ error: 'Cannot call blocked user' });
      }

      const callData = {
        id: callId,
        callerId: req.userId,
        receiverId,
        type,
        status: 'initiating',
        participants: [req.userId, receiverId],
        startTime: admin.firestore.FieldValue.serverTimestamp(),
        endTime: null,
        duration: 0,
        isVideo: type === 'video',
      };

      await db.collection('calls').doc(callId).set(callData);

      res.status(201).json(callData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// End call
router.put('/end/:callId', authenticateUser, async (req, res) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body;

    const callRef = db.collection('calls').doc(callId);
    const callDoc = await callRef.get();

    if (!callDoc.exists) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const callData = callDoc.data();

    if (!callData.participants?.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await callRef.update({
      status: 'ended',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      duration: duration || 0,
    });

    res.json({ message: 'Call ended successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Agora token for video/voice calls
router.get('/token', authenticateUser, async (req, res) => {
  try {
    const channelName = req.query.channel;
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      return res.status(500).json({ error: 'Agora credentials not configured' });
    }

    const uid = req.userId;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    res.json({ token, uid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
