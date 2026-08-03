require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const auth = admin.auth();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const statusRoutes = require('./routes/status');
const callRoutes = require('./routes/calls');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/calls', callRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error('Authentication required'));
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    if (decodedToken.uid !== userId) {
      return next(new Error('Invalid authentication'));
    }

    socket.userId = userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Store user connection
  connectedUsers.set(socket.userId, socket.id);

  // Update user online status
  db.collection('users').doc(socket.userId).update({
    online: true,
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Broadcast online status to contacts
  socket.broadcast.emit('user:online', { userId: socket.userId });

  // Handle private messages
  socket.on('message:send', async (messageData) => {
    try {
      const message = {
        ...messageData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'delivered',
      };

      // Save message to Firestore
      await db
        .collection('chats')
        .doc(messageData.chatId)
        .collection('messages')
        .doc(messageData.id)
        .set(message);

      // Update chat's last message
      await db.collection('chats').doc(messageData.chatId).update({
        lastMessage: {
          id: messageData.id,
          type: messageData.type,
          content: messageData.content,
          senderId: messageData.senderId,
        },
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Emit message to recipients
      const chatDoc = await db.collection('chats').doc(messageData.chatId).get();
      const chatData = chatDoc.data();
      
      if (chatData?.participants) {
        chatData.participants.forEach((participantId) => {
          if (participantId !== messageData.senderId) {
            const recipientSocketId = connectedUsers.get(participantId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('message:new', message);
            }
          }
        });
      }
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('message:error', {
        messageId: messageData.id,
        error: error.message,
      });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', ({ chatId }) => {
    socket.broadcast.emit('typing:start', {
      chatId,
      userId: socket.userId,
    });
  });

  socket.on('typing:stop', ({ chatId }) => {
    socket.broadcast.emit('typing:stop', {
      chatId,
      userId: socket.userId,
    });
  });

  // Handle message read status
  socket.on('message:read', async ({ chatId, messageIds }) => {
    try {
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

      // Notify sender
      socket.broadcast.emit('message:status', {
        chatId,
        messageIds,
        status: 'read',
      });
    } catch (error) {
      console.error('Message read error:', error);
    }
  });

  // Handle call events
  socket.on('call:initiate', (callData) => {
    const recipientSocketId = connectedUsers.get(callData.receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call:incoming', {
        ...callData,
        callerName: socket.userId, // You would fetch the actual name
      });
    }
  });

  socket.on('call:accept', ({ callId }) => {
    socket.broadcast.emit('call:accepted', { callId });
  });

  socket.on('call:reject', ({ callId }) => {
    socket.broadcast.emit('call:rejected', { callId });
  });

  socket.on('call:end', ({ callId }) => {
    socket.broadcast.emit('call:ended', { callId });
  });

  socket.on('call:ice-candidate', ({ callId, candidate }) => {
    socket.broadcast.emit('call:ice-candidate', { callId, candidate });
  });

  // Handle status updates
  socket.on('status:new', (statusData) => {
    socket.broadcast.emit('status:new', statusData);
  });

  socket.on('status:viewed', ({ statusId, userId }) => {
    socket.broadcast.emit('status:viewed', { statusId, userId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    connectedUsers.delete(socket.userId);

    // Update user offline status
    db.collection('users').doc(socket.userId).update({
      online: false,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Broadcast offline status
    socket.broadcast.emit('user:offline', {
      userId: socket.userId,
      lastSeen: new Date().toISOString(),
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`ChatsApp server running on port ${PORT}`);
});

module.exports = { app, server, io };
