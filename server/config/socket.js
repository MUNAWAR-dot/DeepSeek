const socketIO = require('socket.io');

let io = null;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      if (!token || !userId) {
        return next(new Error('Authentication required'));
      }

      // Verify token (implement your token verification)
      const admin = require('firebase-admin');
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      if (decodedToken.uid !== userId) {
        return next(new Error('Invalid authentication'));
      }

      socket.userId = userId;
      socket.userData = decodedToken;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle joining chat rooms
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
