const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const auth = admin.auth();
const db = admin.firestore();

// Register user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('displayName').trim().isLength({ min: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, displayName, phoneNumber } = req.body;

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
        phoneNumber,
      });

      // Create user profile in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        displayName,
        displayNameLower: displayName.toLowerCase(),
        email,
        phoneNumber: phoneNumber || '',
        photoURL: null,
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
      });

      // Generate JWT token
      const token = jwt.sign(
        { uid: userRecord.uid },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Verify credentials with Firebase
      // Note: Firebase doesn't support server-side email/password sign-in directly
      // This is handled client-side. Here we verify the ID token instead.
      
      // For this endpoint, we'll assume the client already authenticated
      // and sent us the Firebase ID token
      const { idToken } = req.body;
      
      if (idToken) {
        const decodedToken = await auth.verifyIdToken(idToken);
        
        // Generate custom JWT
        const token = jwt.sign(
          { uid: decodedToken.uid },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        return res.json({
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
          },
          token,
        });
      }

      res.status(400).json({ error: 'ID token required' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
);

// Verify token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        uid: decoded.uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    const newToken = jwt.sign(
      { uid: decoded.uid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId) {
      await db.collection('users').doc(userId).update({
        online: false,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/delete-account', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Delete user from Firebase Auth
    await auth.deleteUser(userId);
    
    // Delete user data from Firestore
    await db.collection('users').doc(userId).delete();
    
    // Delete user's chats and messages
    const chatsSnapshot = await db
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    const batch = db.batch();
    chatsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
