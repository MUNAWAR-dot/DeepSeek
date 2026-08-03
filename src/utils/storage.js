import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { STORAGE_KEYS } from './constants';

class StorageManager {
  // Regular storage (not encrypted)
  async set(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Storage set failed:', error);
      return false;
    }
  }

  async get(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Storage get failed:', error);
      return defaultValue;
    }
  }

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove failed:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  }

  // Secure storage (encrypted)
  async secureSet(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await EncryptedStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Secure storage set failed:', error);
      return false;
    }
  }

  async secureGet(key, defaultValue = null) {
    try {
      const jsonValue = await EncryptedStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Secure storage get failed:', error);
      return defaultValue;
    }
  }

  async secureRemove(key) {
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Secure storage remove failed:', error);
      return false;
    }
  }

  async secureClear() {
    try {
      await EncryptedStorage.clear();
      return true;
    } catch (error) {
      console.error('Secure storage clear failed:', error);
      return false;
    }
  }

  // App-specific storage methods
  async saveUserData(userData) {
    return this.set(STORAGE_KEYS.USER_DATA, userData);
  }

  async getUserData() {
    return this.get(STORAGE_KEYS.USER_DATA);
  }

  async saveAuthToken(token) {
    return this.secureSet(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken() {
    return this.secureGet(STORAGE_KEYS.AUTH_TOKEN);
  }

  async saveRefreshToken(token) {
    return this.secureSet(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  async getRefreshToken() {
    return this.secureGet(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async saveSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, {});
  }

  async saveTheme(theme) {
    return this.set(STORAGE_KEYS.THEME, theme);
  }

  async getTheme() {
    return this.get(STORAGE_KEYS.THEME, 'light');
  }

  async saveLanguage(language) {
    return this.set(STORAGE_KEYS.LANGUAGE, language);
  }

  async getLanguage() {
    return this.get(STORAGE_KEYS.LANGUAGE, 'en');
  }

  async clearAuthData() {
    await this.secureRemove(STORAGE_KEYS.AUTH_TOKEN);
    await this.secureRemove(STORAGE_KEYS.REFRESH_TOKEN);
    await this.remove(STORAGE_KEYS.USER_DATA);
  }

  async clearAllData() {
    await this.clear();
    await this.secureClear();
  }
}

export default new StorageManager();
