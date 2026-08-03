import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const APP_CONSTANTS = {
  APP_NAME: 'ChatsApp',
  APP_VERSION: '1.0.0',
  
  // Screen dimensions
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  IS_SMALL_DEVICE: SCREEN_WIDTH < 375,
  
  // Platform
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  
  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    LOCATION: 'location',
    CONTACT: 'contact',
    STICKER: 'sticker',
    GIF: 'gif',
    POLL: 'poll',
    SYSTEM: 'system',
  },
  
  // Message Status
  MESSAGE_STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed',
  },
  
  // Chat Types
  CHAT_TYPES: {
    PRIVATE: 'private',
    GROUP: 'group',
    BROADCAST: 'broadcast',
  },
  
  // User Status
  USER_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
    BUSY: 'busy',
  },
  
  // Call Types
  CALL_TYPES: {
    VOICE: 'voice',
    VIDEO: 'video',
  },
  
  // Call Status
  CALL_STATUS: {
    INITIATING: 'initiating',
    RINGING: 'ringing',
    ONGOING: 'ongoing',
    ENDED: 'ended',
    MISSED: 'missed',
    REJECTED: 'rejected',
  },
  
  // Media Limits
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_AUDIO_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENT_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_GROUP_PARTICIPANTS: 256,
  MAX_STATUS_DURATION: 30, // seconds
  
  // Pagination
  MESSAGES_PER_PAGE: 50,
  CONTACTS_PER_PAGE: 20,
  
  // Timeouts
  TYPING_TIMEOUT: 3000, // 3 seconds
  ONLINE_TIMEOUT: 60000, // 1 minute
  CALL_TIMEOUT: 30000, // 30 seconds
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    FCM_TOKEN: 'fcmToken',
    SETTINGS: 'appSettings',
    THEME: 'appTheme',
    LANGUAGE: 'appLanguage',
    LAST_SYNC: 'lastSync',
  },
  
  // Colors
  COLORS: {
    PRIMARY: '#075E54',
    PRIMARY_DARK: '#054C44',
    PRIMARY_LIGHT: '#128C7E',
    SECONDARY: '#25D366',
    SECONDARY_DARK: '#1DA851',
    ACCENT: '#34B7F1',
    BACKGROUND: '#ECE5DD',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY: '#667781',
    LIGHT_GRAY: '#DFE5E7',
    DARK_GRAY: '#525252',
    RED: '#FF0000',
    ERROR: '#E53935',
    WARNING: '#FFA000',
    SUCCESS: '#4CAF50',
    INFO: '#2196F3',
    ONLINE: '#25D366',
    OFFLINE: '#BDBDBD',
  },
  
  // Font Sizes
  FONTS: {
    XS: 10,
    SM: 12,
    MD: 14,
    LG: 16,
    XL: 18,
    XXL: 24,
    XXXL: 32,
  },
  
  // Animation Durations
  ANIMATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
    VERY_LONG: 1000,
  },
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

export const COUNTRIES = [
  { code: 'IN', name: 'India', dial_code: '+91' },
  { code: 'CN', name: 'China', dial_code: '+86' },
  { code: 'PK', name: 'Pakistan', dial_code: '+92' },
  { code: 'BD', name: 'Bangladesh', dial_code: '+880' },
  { code: 'ID', name: 'Indonesia', dial_code: '+62' },
  { code: 'JP', name: 'Japan', dial_code: '+81' },
  { code: 'KR', name: 'South Korea', dial_code: '+82' },
  { code: 'VN', name: 'Vietnam', dial_code: '+84' },
  { code: 'TH', name: 'Thailand', dial_code: '+66' },
  { code: 'MY', name: 'Malaysia', dial_code: '+60' },
  { code: 'PH', name: 'Philippines', dial_code: '+63' },
  { code: 'SG', name: 'Singapore', dial_code: '+65' },
  // Add more countries as needed
];

export default APP_CONSTANTS;
