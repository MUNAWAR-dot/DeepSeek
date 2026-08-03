// src/services/upload.js
const API_URL = 'https://chatsapp-g0dr.onrender.com';

export const uploadImage = async (file) => {
  try {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.log('Upload error:', error);
    throw error;
  }
};

export const uploadVideo = async (file) => {
  try {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'video');

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.log('Upload error:', error);
    throw error;
  }
};

export default { uploadImage, uploadVideo };
