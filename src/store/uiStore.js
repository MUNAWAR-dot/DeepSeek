const uiStore = (set, get) => ({
  // UI State
  theme: 'light',
  language: 'en',
  fontSize: 'medium',
  wallpaper: null,
  chatWallpaper: null,

  // Online Status
  onlineUsers: new Set(),
  userOnlineStatus: {},

  // UI Visibility
  showSearchBar: false,
  showEmojiPicker: false,
  showAttachmentOptions: false,

  // Toast/Notification
  toast: null,
  toastTimeout: null,

  // Loading States
  globalLoading: false,
  loadingMessage: '',

  // Actions
  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  setLanguage: (language) => set({ language }),

  setFontSize: (fontSize) => set({ fontSize }),

  setWallpaper: (wallpaper) => set({ wallpaper }),

  setChatWallpaper: (chatWallpaper) => set({ chatWallpaper }),

  // Online Status Actions
  addOnlineUser: (userId) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.add(userId);
      return {
        onlineUsers,
        userOnlineStatus: {
          ...state.userOnlineStatus,
          [userId]: 'online',
        },
      };
    }),

  removeOnlineUser: (userId) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      onlineUsers.delete(userId);
      return {
        onlineUsers,
        userOnlineStatus: {
          ...state.userOnlineStatus,
          [userId]: 'offline',
        },
      };
    }),

  updateUserOnlineStatus: (userId, status) =>
    set((state) => ({
      userOnlineStatus: {
        ...state.userOnlineStatus,
        [userId]: status,
      },
    })),

  // UI Visibility Actions
  toggleSearchBar: () =>
    set((state) => ({
      showSearchBar: !state.showSearchBar,
    })),

  toggleEmojiPicker: () =>
    set((state) => ({
      showEmojiPicker: !state.showEmojiPicker,
    })),

  toggleAttachmentOptions: () =>
    set((state) => ({
      showAttachmentOptions: !state.showAttachmentOptions,
    })),

  hideAllModals: () =>
    set({
      showSearchBar: false,
      showEmojiPicker: false,
      showAttachmentOptions: false,
    }),

  // Toast Actions
  showToast: (toast) => {
    const state = get();
    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
    }

    const timeout = setTimeout(() => {
      set({ toast: null, toastTimeout: null });
    }, 3000);

    set({
      toast,
      toastTimeout: timeout,
    });
  },

  hideToast: () => {
    const state = get();
    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
    }
    set({ toast: null, toastTimeout: null });
  },

  // Loading Actions
  setGlobalLoading: (globalLoading, loadingMessage = '') =>
    set({
      globalLoading,
      loadingMessage,
    }),

  // Reset UI
  resetUI: () =>
    set({
      showSearchBar: false,
      showEmojiPicker: false,
      showAttachmentOptions: false,
      toast: null,
      globalLoading: false,
      loadingMessage: '',
    }),
});

export default uiStore;
