// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://chatsapp-g0dr.onrender.com';

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  
  register: async (email, password, name) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },
};

export const chatAPI = {
  getAll: async (userId) => {
    const response = await fetch(`${API_URL}/api/chats/${userId}`);
    return response.json();
  },
};

export default { authAPI, chatAPI };
