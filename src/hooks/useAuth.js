import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import useStore from '../store/store';

export const useAuth = () => {
  const [initializing, setInitializing] = useState(true);
  const { user, isAuthenticated, setUser, logout } = useStore();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [initializing]);

  const handleLogout = useCallback(async () => {
    try {
      await auth().signOut();
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    initializing,
    logout: handleLogout,
  };
};
