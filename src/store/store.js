import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStore from './authStore';
import chatStore from './chatStore';
import statusStore from './statusStore';
import callStore from './callStore';
import uiStore from './uiStore';

const useStore = create(
  persist(
    (set, get) => ({
      // Combine all stores
      ...authStore(set, get),
      ...chatStore(set, get),
      ...statusStore(set, get),
      ...callStore(set, get),
      ...uiStore(set, get),

      // Global actions
      resetAll: () => {
        set({
          user: null,
          isAuthenticated: false,
          chats: [],
          messages: {},
          activeChat: null,
          statuses: [],
          calls: [],
          theme: 'light',
        });
      },

      // App initialization state
      isInitialized: false,
      setIsInitialized: (isInitialized) => set({ isInitialized }),

      // Network state
      isConnected: true,
      setIsConnected: (isConnected) => set({ isConnected }),

      // App state
      appState: 'active',
      setAppState: (appState) => set({ appState }),
    }),
    {
      name: 'chatsapp-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

export default useStore;
