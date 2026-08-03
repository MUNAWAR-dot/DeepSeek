import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Register background message handler (only on native platforms)
if (Platform.OS !== 'web') {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  } catch (error) {
    console.log('Firebase messaging not available:', error);
  }
}

// Register the app
registerRootComponent(App);
