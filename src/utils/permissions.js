import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestAllPermissions = async () => {
  try {
    await requestCameraPermission();
    await requestMicrophonePermission();
    await requestStoragePermission();
    await requestLocationPermission();
    await requestContactsPermission();
  } catch (error) {
    console.error('Request permissions failed:', error);
  }
};

export const requestCameraPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

    if (!permission) return true;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) return true;
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    // Blocked - show alert
    showPermissionAlert('Camera');
    return false;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const requestMicrophonePermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    });

    if (!permission) return true;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) return true;
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    showPermissionAlert('Microphone');
    return false;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return false;
  }
};

export const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'ios') return true;

    const permissions = [];
    
    if (Platform.Version >= 33) {
      // Android 13+
      permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
      permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
    } else {
      permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      permissions.push(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }

    for (const permission of permissions) {
      const result = await check(permission);
      if (result !== RESULTS.GRANTED) {
        const requestResult = await request(permission);
        if (requestResult !== RESULTS.GRANTED) {
          showPermissionAlert('Storage');
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Storage permission error:', error);
    return false;
  }
};

export const requestLocationPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!permission) return true;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) return true;
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    showPermissionAlert('Location');
    return false;
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

export const requestContactsPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CONTACTS,
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
    });

    if (!permission) return true;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) return true;
    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }
    
    showPermissionAlert('Contacts');
    return false;
  } catch (error) {
    console.error('Contacts permission error:', error);
    return false;
  }
};

const showPermissionAlert = (permissionName) => {
  Alert.alert(
    `${permissionName} Permission Required`,
    `ChatsApp needs ${permissionName.toLowerCase()} permission to function properly. Please enable it in your device settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]
  );
};
