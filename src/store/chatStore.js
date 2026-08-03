const chatStore = (set, get) => ({
  // Chat State
  chats: [],
  activeChat: null,
  messages: {},
  unreadCounts: {},
  chatLoading: false,
  chatError: null,

  // Message State
  messageQueue: [],
  isSending: false,

  // Typing State
  typingUsers: {},
  typingTimeouts: {},

  // Chat Actions
  setChats: (chats) => set({ chats, chatLoading: false }),

  setChatLoading: (chatLoading) => set({ chatLoading }),

  setChatError: (chatError) => set({ chatError, chatLoading: false }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),

  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      messages: { ...state.messages, [chatId]: undefined },
      unreadCounts: { ...state.unreadCounts, [chatId]: undefined },
    })),

  setActiveChat: (activeChat) => set({ activeChat }),

  archiveChat: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, archived: true } : chat
      ),
    })),

  unarchiveChat: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, archived: false } : chat
      ),
    })),

  pinChat: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: true } : chat
      ),
    })),

  unpinChat: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: false } : chat
      ),
    })),

  muteChat: (chatId, duration) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, muted: true, mutedUntil: Date.now() + duration }
          : chat
      ),
    })),

  unmuteChat: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, muted: false, mutedUntil: null }
          : chat
      ),
    })),

  // Message Actions
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
      chatLoading: false,
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.filter((msg) => msg.id !== messageId),
      },
    })),

  addMessageToQueue: (message) =>
    set((state) => ({
      messageQueue: [...state.messageQueue, message],
    })),

  removeMessageFromQueue: (messageId) =>
    set((state) => ({
      messageQueue: state.messageQueue.filter((msg) => msg.id !== messageId),
    })),

  setIsSending: (isSending) => set({ isSending }),

  // Unread Count Actions
  updateUnreadCount: (chatId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: count },
    })),

  incrementUnreadCount: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: (state.unreadCounts[chatId] || 0) + 1,
      },
    })),

  clearUnreadCount: (chatId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
    })),

  // Typing Actions
  setTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [chatId]: userId },
    })),

  clearTypingUser: (chatId) =>
    set((state) => {
      const typingUsers = { ...state.typingUsers };
      delete typingUsers[chatId];
      return { typingUsers };
    }),

  setTypingTimeout: (chatId, timeoutId) =>
    set((state) => ({
      typingTimeouts: { ...state.typingTimeouts, [chatId]: timeoutId },
    })),

  clearTypingTimeout: (chatId) =>
    set((state) => {
      const typingTimeouts = { ...state.typingTimeouts };
      if (typingTimeouts[chatId]) {
        clearTimeout(typingTimeouts[chatId]);
        delete typingTimeouts[chatId];
      }
      return { typingTimeouts };
    }),

  // Utility
  getChatById: (chatId) => {
    return get().chats.find((chat) => chat.id === chatId);
  },

  getMessagesByChatId: (chatId) => {
    return get().messages[chatId] || [];
  },

  getTotalUnread: () => {
    return Object.values(get().unreadCounts).reduce(
      (sum, count) => sum + count,
      0
    );
  },
});

export default chatStore;
