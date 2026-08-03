import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import auth from '@react-native-firebase/auth';
import useStore from '../store/store';
import userService from '../services/userService';

export const useOnlineStatus = () => {
  const appState = useRef(AppState.currentState);
  const { user, setAppState } = useStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  const handleAppStateChange = async (nextAppState) => {
    if (!user?.uid) return;

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to foreground
      await userService.setOnlineStatus(user.uid, true);
    } else if (
      appState.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to background
      await userService.setOnlineStatus(user.uid, false);
    }

    appState.current = nextAppState;
    setAppState(nextAppState);
  };

  // Set online when component mounts
  useEffect(() => {
    if (user?.uid) {
      userService.setOnlineStatus(user.uid, true);
    }
  }, [user]);
};
