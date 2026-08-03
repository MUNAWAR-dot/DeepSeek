const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

const db = admin.firestore();
const storage = admin.storage();

// Get status feed
router.get('/', authenticateUser, async (req, res) => {
  try {
    // Get user's contacts
    const userDoc = await db.collection('users').doc(req.userId).get();
    const contacts = userDoc.data()?.syncedContacts || [];
    const blockedUsers = userDoc.data()?.blockedUsers || [];

    // Get contact IDs
    const contactIds = contacts
      .filter((c) => c.isAppUser && !blockedUsers.includes(c.appUserId))
      .map((c) => c.appUserId);

    // Add self
    contactIds.push(req.userId);

    if (contactIds.length === 0) return res.json([]);

    // Get active statuses
    const now = admin.firestore.Timestamp.now();
    const allStatuses = [];

    // Process in batches of 10
    for (let i = 0; i < contactIds.length; i += 10) {
      const batch = contactIds.slice(i, i + 10);
      const snapshot = await db
        .collection('statuses')
        .where('userId', 'in', batch)
        .where('expiresAt', '>', now)
        .orderBy('expiresAt', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      snapshot.forEach((doc) => {
        allStatuses.push({ id: doc.id, ...doc.data() });
      });
    }

    // Group by user
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

    const sortedStatuses = Object.values(groupedStatuses).sort(
      (a, b) => b.latestTimestamp?.toMillis() - a.latestTimestamp?.toMillis()
    );

    res.json(sortedStatuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create status
router.post(
  '/create',
  authenticateUser,
  upload.single('media'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No media file provided' });
      }

      const { type = 'image', caption = '' } = req.body;
      const statusId = require('uuid').v4();

      // Upload to Firebase Storage
      const bucket = storage.bucket();
      const filePath = `statuses/${req.userId}/${statusId}_${Date.now()}`;
      
      await bucket.upload(req.file.path, {
        destination: filePath,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      const file = bucket.file(filePath);
      const [mediaUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });

      // Calculate expiry (24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const statusData = {
        id: statusId,
        userId: req.userId,
        type,
        mediaUrl,
        caption,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        viewers: [],
      };

      await db.collection('statuses').doc(statusId).set(statusData);

      // Update user status
      await db.collection('users').doc(req.userId).update({
        hasStatus: true,
        statusTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json(statusData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete status
router.delete('/:statusId/delete', authenticateUser, async (req, res) => {
  try {
    const statusDoc = await db
      .collection('statuses')
      .doc(req.params.statusId)
      .get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: 'Status not found' });
    }

    const statusData = statusDoc.data();

    if (statusData.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete media from storage
    if (statusData.mediaUrl) {
      try {
        const file = storage.bucket().file(
          `statuses/${req.userId}/${statusData.id}`
        );
        await file.delete();
      } catch (err) {
        console.error('Error deleting status file:', err);
      }
    }

    await db.collection('statuses').doc(req.params.statusId).delete();

    // Check if user has other statuses
    const remainingStatuses = await db
      .collection('statuses')
      .where('userId', '==', req.userId)
      .where('expiresAt', '>', admin.firestore.Timestamp.now())
      .limit(1)
      .get();

    if (remainingStatuses.empty) {
      await db.collection('users').doc(req.userId).update({
        hasStatus: false,
      });
    }

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View status
router.post('/:statusId/view', authenticateUser, async (req, res) => {
  try {
    const statusRef = db.collection('statuses').doc(req.params.statusId);
    const statusDoc = await statusRef.get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: 'Status not found' });
    }

    await statusRef.update({
      viewers: admin.firestore.FieldValue.arrayUnion({
        userId: req.userId,
        viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
    });

    res.json({ message: 'Status viewed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my statuses
router.get('/my', authenticateUser, async (req, res) => {
  try {
    const snapshot = await db
      .collection('statuses')
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const statuses = [];
    snapshot.forEach((doc) => {
      statuses.push({ id: doc.id, ...doc.data() });
    });

    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
