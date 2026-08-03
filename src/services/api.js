// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Render backend URL
const API_URL = 'https://chatsapp-g0dr.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTH APIS ====================
export const authAPI = {
  // Register new user
  register: (email, password, name) => 
    api.post('/api/auth/register', { email, password, name }),
  
  // Login user
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
};

// ==================== USER APIS ====================
export const userAPI = {
  // Get user by ID
  getById: (id) => api.get(`/api/users/${id}`),
  
  // Update profile
  updateProfile: (userId, data) => 
    api.put('/api/users/profile', { userId, ...data }),
  
  // Search users
  search: (query) => api.get(`/api/users/search/${query}`),
};

// ==================== CHAT APIS ====================
export const chatAPI = {
  // Get user's chats
  getAll: (userId) => api.get(`/api/chats/${userId}`),
  
  // Create chat (1-on-1)
  create: (userId1, userId2) => 
    api.post('/api/chats', { userId1, userId2 }),
  
  // Create group chat
  createGroup: (participants, groupName) => 
    api.post('/api/chats', { 
      isGroup: true, 
      participants, 
      groupName 
    }),
};

// ==================== MESSAGE APIS ====================
export const messageAPI = {
  // Get messages for a chat
  getByChatId: (chatId) => api.get(`/api/messages/${chatId}`),
  
  // Send a message
  send: (chatId, senderId, type, content, fileUrl, fileName) => 
    api.post('/api/messages', { chatId, senderId, type, content, fileUrl, fileName }),
};

// ==================== UPLOAD API ====================
export const uploadAPI = {
  // Upload file (image/video/audio)
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
