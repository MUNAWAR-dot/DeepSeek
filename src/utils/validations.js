export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

export const isValidURL = (url) => {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url);
};

export const isNumeric = (value) => {
  return /^\d+$/.test(value);
};

export const validateMessage = (text) => {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (text.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }
  return { valid: true };
};

export const validateGroupName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Group name cannot be empty' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Group name must be at least 2 characters' };
  }
  if (name.length > 25) {
    return { valid: false, error: 'Group name must be 25 characters or less' };
  }
  return { valid: true };
};

export const validateFileSize = (size, maxSize) => {
  if (size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxMB}MB`,
    };
  }
  return { valid: true };
};

export const validateFileType = (fileName, allowedTypes) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed`,
    };
  }
  return { valid: true };
};
