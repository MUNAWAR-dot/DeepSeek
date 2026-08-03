import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  persistence: true,
});

if (!__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
  crashlytics().setCrashlyticsCollectionEnabled(true);
}

export {
  firebase,
  auth,
  firestore,
  storage,
  messaging,
  analytics,
  crashlytics,
};

export default firebase;
