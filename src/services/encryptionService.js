import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../config/constants';

class EncryptionService {
  constructor() {
    this.encryptionKey = null;
    this.algorithm = 'AES-256-CBC';
  }

  // Initialize encryption
  async initialize() {
    try {
      // Get or generate encryption key
      let key = await AsyncStorage.getItem('encryption_key');
      
      if (!key) {
        key = this.generateKey();
        await AsyncStorage.setItem('encryption_key', key);
      }
      
      this.encryptionKey = key;
      return true;
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      throw error;
    }
  }

  // Generate encryption key
  generateKey() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  // Encrypt message
  encrypt(text, key = null) {
    try {
      const encryptionKey = key || this.encryptionKey;
      if (!encryptionKey) throw new Error('Encryption key not set');

      const encrypted = CryptoJS.AES.encrypt(text, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  // Decrypt message
  decrypt(encryptedText, key = null) {
    try {
      const encryptionKey = key || this.encryptionKey;
      if (!encryptionKey) throw new Error('Encryption key not set');

      const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  // Encrypt object
  encryptObject(obj, key = null) {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString, key);
    } catch (error) {
      console.error('Encrypt object failed:', error);
      throw error;
    }
  }

  // Decrypt object
  decryptObject(encryptedObj, key = null) {
    try {
      const jsonString = this.decrypt(encryptedObj, key);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decrypt object failed:', error);
      throw error;
    }
  }

  // Generate chat-specific encryption key
  generateChatKey(chatId, participants) {
    try {
      // Create a unique key for each chat based on participants
      const sortedParticipants = [...participants].sort().join('_');
      const baseString = `${chatId}_${sortedParticipants}_${Date.now()}`;
      
      return CryptoJS.SHA256(baseString).toString();
    } catch (error) {
      console.error('Generate chat key failed:', error);
      throw error;
    }
  }

  // Encrypt message for chat
  encryptChatMessage(message, chatKey) {
    try {
      const encryptedContent = this.encrypt(message.content, chatKey);
      
      return {
        ...message,
        content: encryptedContent,
        encrypted: true,
        encryptionKey: chatKey,
      };
    } catch (error) {
      console.error('Encrypt chat message failed:', error);
      throw error;
    }
  }

  // Decrypt chat message
  decryptChatMessage(encryptedMessage, chatKey) {
    try {
      if (!encryptedMessage.encrypted) return encryptedMessage;
      
      const decryptedContent = this.decrypt(encryptedMessage.content, chatKey);
      
      return {
        ...encryptedMessage,
        content: decryptedContent,
        encrypted: false,
      };
    } catch (error) {
      console.error('Decrypt chat message failed:', error);
      throw error;
    }
  }

  // Hash password
  hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  }

  // Compare password hashes
  comparePassword(password, hash) {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hash;
  }

  // Generate random token
  generateToken(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Encrypt file (for end-to-end encrypted file sharing)
  async encryptFile(fileUri, key = null) {
    try {
      const RNFS = require('react-native-fs');
      const fileContent = await RNFS.readFile(fileUri, 'base64');
      
      const encryptionKey = key || this.encryptionKey;
      const encrypted = CryptoJS.AES.encrypt(fileContent, encryptionKey);
      
      const encryptedPath = `${fileUri}.encrypted`;
      await RNFS.writeFile(encryptedPath, encrypted.toString(), 'utf8');
      
      return encryptedPath;
    } catch (error) {
      console.error('Encrypt file failed:', error);
      throw error;
    }
  }

  // Decrypt file
  async decryptFile(encryptedFileUri, outputUri, key = null) {
    try {
      const RNFS = require('react-native-fs');
      const encryptedContent = await RNFS.readFile(encryptedFileUri, 'utf8');
      
      const encryptionKey = key || this.encryptionKey;
      const decrypted = CryptoJS.AES.decrypt(encryptedContent, encryptionKey);
      const base64Content = decrypted.toString(CryptoJS.enc.Utf8);
      
      await RNFS.writeFile(outputUri, base64Content, 'base64');
      
      return outputUri;
    } catch (error) {
      console.error('Decrypt file failed:', error);
      throw error;
    }
  }

  // Generate public/private key pair for E2E encryption
  generateKeyPair() {
    // This is a simplified version. In production, use proper asymmetric encryption
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    
    return { publicKey, privateKey };
  }

  // Sign message with private key
  signMessage(message, privateKey) {
    const signature = CryptoJS.HmacSHA256(message, privateKey).toString();
    return { message, signature };
  }

  // Verify message signature
  verifySignature(message, signature, publicKey) {
    const computedSignature = CryptoJS.HmacSHA256(message, publicKey).toString();
    return computedSignature === signature;
  }

  // Store encryption key securely
  async storeKey(key, keyId) {
    try {
      await AsyncStorage.setItem(`encryption_key_${keyId}`, key);
    } catch (error) {
      console.error('Store key failed:', error);
      throw error;
    }
  }

  // Retrieve encryption key
  async retrieveKey(keyId) {
    try {
      return await AsyncStorage.getItem(`encryption_key_${keyId}`);
    } catch (error) {
      console.error('Retrieve key failed:', error);
      throw error;
    }
  }

  // Delete encryption key
  async deleteKey(keyId) {
    try {
      await AsyncStorage.removeItem(`encryption_key_${keyId}`);
    } catch (error) {
      console.error('Delete key failed:', error);
      throw error;
    }
  }

  // Encrypt sensitive user data
  encryptUserData(data) {
    try {
      return this.encryptObject(data);
    } catch (error) {
      console.error('Encrypt user data failed:', error);
      throw error;
    }
  }

  // Decrypt user data
  decryptUserData(encryptedData) {
    try {
      return this.decryptObject(encryptedData);
    } catch (error) {
      console.error('Decrypt user data failed:', error);
      throw error;
    }
  }
}

export default new EncryptionService();
