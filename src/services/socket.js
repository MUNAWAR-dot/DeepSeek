// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://chatsapp-g0dr.onrender.com';

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId },
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('sendMessage', data);
  }
};

export const sendTyping = (data) => {
  if (socket) {
    socket.emit('typing', data);
  }
};

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
  sendMessage,
  sendTyping,
};
