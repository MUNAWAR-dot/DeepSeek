export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
  GIF: 'gif',
  SYSTEM: 'system',
  POLL: 'poll',
};

export const CHAT_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
  BROADCAST: 'broadcast',
};

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

export const CALL_STATUS = {
  INITIATING: 'initiating',
  RINGING: 'ringing',
  ONGOING: 'ongoing',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

export const PRIVACY_OPTIONS = {
  EVERYONE: 'everyone',
  MY_CONTACTS: 'my_contacts',
  MY_CONTACTS_EXCEPT: 'my_contacts_except',
  ONLY_SHARE_WITH: 'only_share_with',
  NOBODY: 'nobody',
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  GROUP: 'group',
  STATUS: 'status',
  SYSTEM: 'system',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@chatsapp/auth_token',
  REFRESH_TOKEN: '@chatsapp/refresh_token',
  USER_DATA: '@chatsapp/user_data',
  FCM_TOKEN: '@chatsapp/fcm_token',
  SETTINGS: '@chatsapp/settings',
  THEME: '@chatsapp/theme',
  LANGUAGE: '@chatsapp/language',
  FONT_SIZE: '@chatsapp/font_size',
  WALLPAPER: '@chatsapp/wallpaper',
  LAST_SYNC: '@chatsapp/last_sync',
  ENCRYPTION_KEY: '@chatsapp/encryption_key',
};

export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 100 * 1024 * 1024, // 100MB
};

export const PAGINATION = {
  MESSAGES_PER_PAGE: 50,
  CONTACTS_PER_PAGE: 20,
  CHATS_PER_PAGE: 30,
  CALLS_PER_PAGE: 30,
};

export const TIMEOUTS = {
  TYPING_INDICATOR: 3000,
  ONLINE_STATUS: 60000,
  CALL_RINGING: 30000,
  MESSAGE_RESEND: 5000,
  SEARCH_DEBOUNCE: 300,
};

export const UI_CONSTANTS = {
  AVATAR_SIZES: {
    SMALL: 36,
    MEDIUM: 48,
    LARGE: 56,
    XLARGE: 80,
    XXLARGE: 120,
  },
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    XLARGE: 16,
    ROUND: 999,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  FONT_SIZES: {
    XS: 10,
    SM: 12,
    MD: 14,
    LG: 16,
    XL: 18,
    XXL: 24,
    XXXL: 32,
  },
};
