import {
  firebase,
  auth,
  firestore,
  storage,
  messaging,
  analytics,
  crashlytics,
} from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { APP_CONSTANTS } from '../config/constants';

const { STORAGE_KEYS } = APP_CONSTANTS;

export const initializeFirebase = async () => {
  try {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    // Initialize auth state listener
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        
        // Update user's online status
        await firestore().collection('users').doc(user.uid).update({
          lastSeen: firestore.FieldValue.serverTimestamp(),
          online: true,
        });
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    });

    // Setup FCM
    await setupFCM();

    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
};

export const setupFCM = async () => {
  try {
    // Request permission for iOS
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('User declined notification permissions');
        return;
      }
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, fcmToken);
      await updateFCMTokenInFirestore(fcmToken);
    }

    // Listen for token refresh
    messaging().onTokenRefresh(async (token) => {
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
      await updateFCMTokenInFirestore(token);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      // Handle foreground message
      console.log('Foreground message:', remoteMessage);
    });

    // Handle notification open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      // Handle notification open
      console.log('Notification opened:', remoteMessage);
    });

    // Check if app was opened from a notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      // App was opened by a notification
      console.log('App opened by notification:', initialNotification);
    }
  } catch (error) {
    console.error('FCM setup failed:', error);
  }
};

export const updateFCMTokenInFirestore = async (token) => {
  const userId = auth().currentUser?.uid;
  if (!userId) return;

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        fcmTokens: firestore.FieldValue.arrayUnion(token),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        },
      });
  } catch (error) {
    console.error('Update FCM token failed:', error);
  }
};

export const removeFCMToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
    const userId = auth().currentUser?.uid;

    if (token && userId) {
      await messaging().deleteToken();
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          fcmTokens: firestore.FieldValue.arrayRemove(token),
        });
      await AsyncStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    }
  } catch (error) {
    console.error('Remove FCM token failed:', error);
  }
};

// Auth Methods
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    // Create/Update user profile
    await createUserProfileIfNeeded(userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};

export const signInWithPhone = async (phoneNumber) => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error) {
    console.error('Phone Sign-In failed:', error);
    throw error;
  }
};

export const confirmPhoneCode = async (confirmation, code) => {
  try {
    const userCredential = await confirmation.confirm(code);
    
    // Create/Update user profile
    await createUserProfileIfNeeded(userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    console.error('Code confirmation failed:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password, isSignUp = false) => {
  try {
    let userCredential;
    
    if (isSignUp) {
      userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await createUserProfile(userCredential.user.uid, {
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      userCredential = await auth().signInWithEmailAndPassword(email, password);
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Email Sign-In failed:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const userId = auth().currentUser?.uid;
    
    // Update online status
    if (userId) {
      await firestore().collection('users').doc(userId).update({
        online: false,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Remove FCM token
    await removeFCMToken();
    
    // Sign out from Google
    await GoogleSignin.signOut();
    
    // Sign out from Firebase
    await auth().signOut();
    
    // Clear local storage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
};

export const createUserProfile = async (userId, userData) => {
  try {
    const defaultProfile = {
      displayName: userData.email?.split('@')[0] || 'User',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      photoURL: null,
      status: 'Hey there! I am using ChatsApp',
      about: 'Available',
      online: true,
      lastSeen: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
        fontSize: 'medium',
      },
      privacy: {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        about: 'everyone',
        status: 'my_contacts',
        readReceipts: true,
        groups: 'everyone',
      },
      fcmTokens: [],
    };

    await firestore()
      .collection('users')
      .doc(userId)
      .set(defaultProfile, { merge: true });
  } catch (error) {
    console.error('Create user profile failed:', error);
    throw error;
  }
};

export const createUserProfileIfNeeded = async (user) => {
  try {
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      await createUserProfile(user.uid, {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || null,
      });
    } else {
      // Update existing user's online status
      await firestore().collection('users').doc(user.uid).update({
        online: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Create/Update user profile failed:', error);
  }
};

// Firestore helper functions
export const getUserData = async (userId) => {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('Get user data failed:', error);
    return null;
  }
};

export const updateUserData = async (userId, data) => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Update user data failed:', error);
    throw error;
  }
};

export const uploadFile = async (uri, path, onProgress) => {
  try {
    const reference = storage().ref(path);
    const task = reference.putFile(uri);

    // Listen for progress
    if (onProgress) {
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      });
    }

    await task;
    const url = await reference.getDownloadURL();
    return url;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    await storage().ref(path).delete();
  } catch (error) {
    console.error('File delete failed:', error);
    throw error;
  }
};

export default {
  auth,
  firestore,
  storage,
  messaging,
  analytics,
  crashlytics,
};
