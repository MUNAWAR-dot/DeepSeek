import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../config/constants';
import useStore from '../store/store';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeSocket = async () => {
  try {
    const token = await AsyncStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    const userId = useStore.getState().user?.uid;

    if (!token || !userId) {
      console.log('No auth token or user ID for socket connection');
      return;
    }

    const SOCKET_URL = process.env.SOCKET_URL || 'https://chatsapp-api.onrender.com';

    socket = io(SOCKET_URL, {
      auth: {
        token,
        userId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    setupSocketListeners();
    return socket;
  } catch (error) {
    console.error('Socket initialization failed:', error);
    throw error;
  }
};

const setupSocketListeners = () => {
  if (!socket) return;

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    reconnectAttempts = 0;
    
    // Update user online status
    socket.emit('user:online', {
      userId: useStore.getState().user?.uid,
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    
    if (reason === 'io server disconnect') {
      // Server disconnected, try to reconnect
      reconnect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      socket.disconnect();
    }
  });

  // Message events
  socket.on('message:new', handleNewMessage);
  socket.on('message:status', handleMessageStatus);
  socket.on('message:deleted', handleMessageDeleted);
  socket.on('message:edited', handleMessageEdited);

  // Typing events
  socket.on('typing:start', handleTypingStart);
  socket.on('typing:stop', handleTypingStop);

  // User presence events
  socket.on('user:online', handleUserOnline);
  socket.on('user:offline', handleUserOffline);
  socket.on('user:status', handleUserStatus);

  // Chat events
  socket.on('chat:new', handleNewChat);
  socket.on('chat:updated', handleChatUpdated);
  socket.on('chat:deleted', handleChatDeleted);

  // Status events
  socket.on('status:new', handleNewStatus);
  socket.on('status:deleted', handleStatusDeleted);
  socket.on('status:viewed', handleStatusViewed);

  // Call events
  socket.on('call:incoming', handleIncomingCall);
  socket.on('call:accepted', handleCallAccepted);
  socket.on('call:rejected', handleCallRejected);
  socket.on('call:ended', handleCallEnded);
  socket.on('call:ice-candidate', handleIceCandidate);

  // Group events
  socket.on('group:created', handleGroupCreated);
  socket.on('group:updated', handleGroupUpdated);
  socket.on('group:member-added', handleGroupMemberAdded);
  socket.on('group:member-removed', handleGroupMemberRemoved);
};

// Message Handlers
const handleNewMessage = (message) => {
  const store = useStore.getState();
  const { activeChat } = store;
  
  // Add message to store
  store.addMessage(message.chatId, message);
  
  // Update chat's last message
  store.updateChat(message.chatId, {
    lastMessage: message,
    lastMessageTime: message.timestamp,
  });

  // Update unread count if not in active chat
  if (!activeChat || activeChat.id !== message.chatId) {
    store.incrementUnreadCount(message.chatId);
  }

  // Mark as delivered
  if (message.senderId !== store.user?.uid) {
    socket.emit('message:delivered', {
      messageId: message.id,
      chatId: message.chatId,
    });
  }
};

const handleMessageStatus = ({ messageId, chatId, status }) => {
  const store = useStore.getState();
  store.updateMessage(chatId, messageId, { status });
};

const handleMessageDeleted = ({ messageId, chatId }) => {
  const store = useStore.getState();
  store.deleteMessage(chatId, messageId);
};

const handleMessageEdited = ({ messageId, chatId, content }) => {
  const store = useStore.getState();
  store.updateMessage(chatId, messageId, {
    content,
    edited: true,
    editedAt: new Date().toISOString(),
  });
};

// Typing Handlers
const handleTypingStart = ({ chatId, userId }) => {
  const store = useStore.getState();
  store.setTypingUser(chatId, userId);
  
  // Auto clear after 3 seconds
  setTimeout(() => {
    store.clearTypingUser(chatId);
  }, APP_CONSTANTS.TYPING_TIMEOUT);
};

const handleTypingStop = ({ chatId, userId }) => {
  const store = useStore.getState();
  store.clearTypingUser(chatId);
};

// User Presence Handlers
const handleUserOnline = ({ userId }) => {
  const store = useStore.getState();
  store.addOnlineUser(userId);
  store.updateUserOnlineStatus(userId, 'online');
};

const handleUserOffline = ({ userId, lastSeen }) => {
  const store = useStore.getState();
  store.removeOnlineUser(userId);
  store.updateUserOnlineStatus(userId, 'offline');
};

const handleUserStatus = ({ userId, status }) => {
  const store = useStore.getState();
  store.updateUserOnlineStatus(userId, status);
};

// Chat Handlers
const handleNewChat = (chat) => {
  const store = useStore.getState();
  store.addChat(chat);
};

const handleChatUpdated = ({ chatId, updates }) => {
  const store = useStore.getState();
  store.updateChat(chatId, updates);
};

const handleChatDeleted = ({ chatId }) => {
  const store = useStore.getState();
  store.removeChat(chatId);
};

// Status Handlers
const handleNewStatus = (status) => {
  const store = useStore.getState();
  store.addStatus(status);
};

const handleStatusDeleted = ({ statusId }) => {
  const store = useStore.getState();
  store.removeStatus(statusId);
};

const handleStatusViewed = ({ statusId, userId }) => {
  const store = useStore.getState();
  store.markStatusAsViewed(statusId, userId);
};

// Call Handlers
const handleIncomingCall = (callData) => {
  const store = useStore.getState();
  store.setIncomingCall(callData);
};

const handleCallAccepted = (callData) => {
  const store = useStore.getState();
  store.setActiveCall(callData);
  store.setIncomingCall(null);
};

const handleCallRejected = ({ callId }) => {
  const store = useStore.getState();
  store.setIncomingCall(null);
  store.addCall({
    id: callId,
    status: 'rejected',
    timestamp: new Date().toISOString(),
  });
};

const handleCallEnded = ({ callId, duration }) => {
  const store = useStore.getState();
  store.endCall();
  store.updateCall(callId, {
    status: 'ended',
    duration,
    endedAt: new Date().toISOString(),
  });
};

const handleIceCandidate = ({ candidate, callId }) => {
  // Handle WebRTC ICE candidates
  console.log('ICE candidate received:', candidate);
};

// Group Handlers
const handleGroupCreated = (group) => {
  const store = useStore.getState();
  store.addChat(group);
};

const handleGroupUpdated = ({ groupId, updates }) => {
  const store = useStore.getState();
  store.updateChat(groupId, updates);
};

const handleGroupMemberAdded = ({ groupId, member }) => {
  const store = useStore.getState();
  const group = store.getChatById(groupId);
  if (group) {
    const updatedParticipants = [...(group.participants || []), member];
    store.updateChat(groupId, { participants: updatedParticipants });
  }
};

const handleGroupMemberRemoved = ({ groupId, memberId }) => {
  const store = useStore.getState();
  const group = store.getChatById(groupId);
  if (group) {
    const updatedParticipants = (group.participants || []).filter(
      (p) => p.userId !== memberId
    );
    store.updateChat(groupId, { participants: updatedParticipants });
  }
};

// Socket Emit Methods
export const emitMessage = (data) => {
  if (socket?.connected) {
    socket.emit('message:send', data);
  }
};

export const emitTypingStart = (chatId) => {
  if (socket?.connected) {
    socket.emit('typing:start', { chatId });
  }
};

export const emitTypingStop = (chatId) => {
  if (socket?.connected) {
    socket.emit('typing:stop', { chatId });
  }
};

export const emitMessageRead = (chatId, messageIds) => {
  if (socket?.connected) {
    socket.emit('message:read', { chatId, messageIds });
  }
};

export const emitCallInitiate = (callData) => {
  if (socket?.connected) {
    socket.emit('call:initiate', callData);
  }
};

export const emitCallAccept = (callId) => {
  if (socket?.connected) {
    socket.emit('call:accept', { callId });
  }
};

export const emitCallReject = (callId) => {
  if (socket?.connected) {
    socket.emit('call:reject', { callId });
  }
};

export const emitCallEnd = (callId) => {
  if (socket?.connected) {
    socket.emit('call:end', { callId });
  }
};

export const emitIceCandidate = (callId, candidate) => {
  if (socket?.connected) {
    socket.emit('call:ice-candidate', { callId, candidate });
  }
};

// Connection Management
export const reconnect = () => {
  if (socket) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  emitMessage,
  emitTypingStart,
  emitTypingStop,
  emitMessageRead,
  emitCallInitiate,
  emitCallAccept,
  emitCallReject,
  emitCallEnd,
  emitIceCandidate,
};
