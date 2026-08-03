const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Check if user is blocked
    const currentUserDoc = await db.collection('users').doc(req.userId).get();
    const blockedUsers = currentUserDoc.data()?.blockedUsers || [];
    
    if (blockedUsers.includes(req.params.userId)) {
      return res.status(403).json({ error: 'User is blocked' });
    }

    res.json({
      id: userDoc.id,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      status: userData.status,
      about: userData.about,
      online: userData.online,
      lastSeen: userData.lastSeen,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put(
  '/profile/update',
  authenticateUser,
  [
    body('displayName').optional().trim().isLength({ min: 2 }),
    body('status').optional().trim().isLength({ max: 139 }),
    body('about').optional().trim().isLength({ max: 139 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = {};
      const allowedUpdates = ['displayName', 'status', 'about'];
      
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
          if (field === 'displayName') {
            updates.displayNameLower = req.body[field].toLowerCase();
          }
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection('users').doc(req.userId).update(updates);

      // Update Firebase Auth profile if name changed
      if (updates.displayName) {
        await auth.updateUser(req.userId, {
          displayName: updates.displayName,
        });
      }

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Upload profile photo
router.post(
  '/profile/photo',
  authenticateUser,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const bucket = storage.bucket();
      const filePath = `users/${req.userId}/profile_photo_${Date.now()}.jpg`;
      
      await bucket.upload(req.file.path, {
        destination: filePath,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      const file = bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });

      // Update user profile
      await db.collection('users').doc(req.userId).update({
        photoURL: url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await auth.updateUser(req.userId, {
        photoURL: url,
      });

      res.json({ photoURL: url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Search users
router.get(
  '/search',
  authenticateUser,
  [query('q').trim().isLength({ min: 2 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const searchTerm = req.query.q.toLowerCase();
      const limit = parseInt(req.query.limit) || 20;

      // Search by display name
      const nameSnapshot = await db
        .collection('users')
        .where('displayNameLower', '>=', searchTerm)
        .where('displayNameLower', '<=', searchTerm + '\uf8ff')
        .limit(limit)
        .get();

      // Search by phone number
      const phoneSnapshot = await db
        .collection('users')
        .where('phoneNumber', '>=', searchTerm)
        .where('phoneNumber', '<=', searchTerm + '\uf8ff')
        .limit(limit)
        .get();

      const users = new Map();

      nameSnapshot.forEach((doc) => {
        if (doc.id !== req.userId) {
          users.set(doc.id, {
            id: doc.id,
            displayName: doc.data().displayName,
            photoURL: doc.data().photoURL,
            status: doc.data().status,
          });
        }
      });

      phoneSnapshot.forEach((doc) => {
        if (doc.id !== req.userId) {
          users.set(doc.id, {
            id: doc.id,
            displayName: doc.data().displayName,
            photoURL: doc.data().photoURL,
            phoneNumber: doc.data().phoneNumber,
            status: doc.data().status,
          });
        }
      });

      res.json(Array.from(users.values()).slice(0, limit));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get user contacts
router.get('/contacts', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    const syncedContacts = userDoc.data()?.syncedContacts || [];

    res.json(syncedContacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync contacts
router.post(
  '/contacts/sync',
  authenticateUser,
  [body('contacts').isArray()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contacts } = req.body;
      const phoneNumbers = contacts.map((c) => c.phoneNumber);

      // Find which contacts are on ChatsApp
      const appUsers = [];
      
      // Process in batches of 10 (Firestore 'in' query limit)
      for (let i = 0; i < phoneNumbers.length; i += 10) {
        const batch = phoneNumbers.slice(i, i + 10);
        const snapshot = await db
          .collection('users')
          .where('phoneNumber', 'in', batch)
          .get();

        snapshot.forEach((doc) => {
          appUsers.push({
            id: doc.id,
            phoneNumber: doc.data().phoneNumber,
          });
        });
      }

      // Sync contacts with app users
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

      await db.collection('users').doc(req.userId).update({
        syncedContacts,
        contactsLastSynced: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json(syncedContacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Block user
router.post('/block/:userId', authenticateUser, async (req, res) => {
  try {
    await db
      .collection('users')
      .doc(req.userId)
      .update({
        blockedUsers: admin.firestore.FieldValue.arrayUnion(req.params.userId),
      });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock user
router.post('/unblock/:userId', authenticateUser, async (req, res) => {
  try {
    await db
      .collection('users')
      .doc(req.userId)
      .update({
        blockedUsers: admin.firestore.FieldValue.arrayRemove(req.params.userId),
      });

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blocked users
router.get('/blocked', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    const blockedIds = userDoc.data()?.blockedUsers || [];

    const blockedUsers = [];
    for (const id of blockedIds) {
      const userDoc = await db.collection('users').doc(id).get();
      if (userDoc.exists) {
        blockedUsers.push({
          id: userDoc.id,
          displayName: userDoc.data().displayName,
          photoURL: userDoc.data().photoURL,
        });
      }
    }

    res.json(blockedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report user
router.post(
  '/report',
  authenticateUser,
  [
    body('reportedUserId').isString(),
    body('reason').isString().isLength({ min: 5 }),
    body('description').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reportedUserId, reason, description } = req.body;

      await db.collection('reports').add({
        reportedBy: req.userId,
        reportedUser: reportedUserId,
        reason,
        description: description || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });

      res.json({ message: 'Report submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update privacy settings
router.put('/privacy', authenticateUser, async (req, res) => {
  try {
    const allowedSettings = [
      'lastSeen',
      'profilePhoto',
      'about',
      'status',
      'readReceipts',
      'groups',
      'liveLocation',
      'fingerprintLock',
      'screenSecurity',
    ];

    const privacy = {};
    allowedSettings.forEach((setting) => {
      if (req.body[setting] !== undefined) {
        privacy[setting] = req.body[setting];
      }
    });

    await db.collection('users').doc(req.userId).update({
      privacy,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Privacy settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get online status
router.get('/online-status/:userId', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Check privacy settings
    const privacy = userData.privacy?.lastSeen || 'everyone';
    if (privacy === 'nobody') {
      return res.json({ online: false, lastSeen: null });
    }

    res.json({
      online: userData.online || false,
      lastSeen: userData.lastSeen?.toDate() || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
