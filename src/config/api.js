import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = Config.API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        // You might want to dispatch a logout action here
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Network error occurred';
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyPhone: '/auth/verify-phone',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    deleteAccount: '/auth/delete-account',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile/update',
    searchUsers: '/users/search',
    getContacts: '/users/contacts',
    addContact: '/users/contacts/add',
    blockUser: '/users/block',
    reportUser: '/users/report',
    getOnlineStatus: '/users/online-status',
  },
  chats: {
    getChats: '/chats',
    createChat: '/chats/create',
    getChat: '/chats/:chatId',
    updateChat: '/chats/:chatId/update',
    deleteChat: '/chats/:chatId/delete',
    archiveChat: '/chats/:chatId/archive',
    muteChat: '/chats/:chatId/mute',
    pinChat: '/chats/:chatId/pin',
    addParticipants: '/chats/:chatId/participants/add',
    removeParticipants: '/chats/:chatId/participants/remove',
    leaveGroup: '/chats/:chatId/leave',
  },
  messages: {
    getMessages: '/messages/:chatId',
    sendMessage: '/messages/send',
    deleteMessage: '/messages/:messageId/delete',
    editMessage: '/messages/:messageId/edit',
    forwardMessage: '/messages/forward',
    markAsRead: '/messages/read',
    getMedia: '/messages/:chatId/media',
  },
  status: {
    getStatuses: '/status',
    createStatus: '/status/create',
    deleteStatus: '/status/:statusId/delete',
    viewStatus: '/status/:statusId/view',
    getMyStatus: '/status/my',
  },
  calls: {
    getCallHistory: '/calls/history',
    initiateCall: '/calls/initiate',
    endCall: '/calls/end',
    getCallToken: '/calls/token',
  },
};

export default api;
