const authStore = (set, get) => ({
  // Auth State
  user: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
  authToken: null,
  refreshToken: null,

  // Profile State
  userProfile: null,
  profileLoading: false,
  profileError: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      authError: null,
    }),

  setAuthLoading: (authLoading) => set({ authLoading }),

  setAuthError: (authError) =>
    set({
      authError,
      authLoading: false,
    }),

  setTokens: ({ authToken, refreshToken }) =>
    set({
      authToken,
      refreshToken,
    }),

  setUserProfile: (userProfile) =>
    set({
      userProfile,
      profileLoading: false,
      profileError: null,
    }),

  setProfileLoading: (profileLoading) => set({ profileLoading }),

  setProfileError: (profileError) =>
    set({
      profileError,
      profileLoading: false,
    }),

  updateUserProfile: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
      userProfile: state.userProfile
        ? { ...state.userProfile, ...updates }
        : null,
    })),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      authToken: null,
      refreshToken: null,
      userProfile: null,
      chats: [],
      messages: {},
      activeChat: null,
      statuses: [],
      calls: [],
    }),

  clearAuthError: () => set({ authError: null }),
});

export default authStore;
