const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

class Encryption {
  constructor() {
    this.key = process.env.ENCRYPTION_KEY 
      ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
      : crypto.randomBytes(KEY_LENGTH);
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        iv: iv.toString('hex'),
        content: encrypted,
        tag: tag.toString('hex'),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  decrypt(encryptedData) {
    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  generateKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return { salt, hash };
  }

  verifyPassword(password, hash, salt) {
    const newHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === newHash;
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new Encryption();
