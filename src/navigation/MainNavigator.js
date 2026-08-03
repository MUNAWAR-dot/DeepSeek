import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

import ChatRoomScreen from '../screens/Chats/ChatRoomScreen';
import NewChatScreen from '../screens/Chats/NewChatScreen';
import GroupInfoScreen from '../screens/Chats/GroupInfoScreen';
import MediaPreviewScreen from '../screens/Chats/MediaPreviewScreen';
import StarredMessagesScreen from '../screens/Chats/StarredMessagesScreen';
import SearchMessagesScreen from '../screens/Chats/SearchMessagesScreen';

import StatusViewScreen from '../screens/Status/StatusViewScreen';
import CreateStatusScreen from '../screens/Status/CreateStatusScreen';

import VoiceCallScreen from '../screens/Calls/VoiceCallScreen';
import VideoCallScreen from '../screens/Calls/VideoCallScreen';

import SettingsScreen from '../screens/Settings/SettingsScreen';
import ProfileScreen from '../screens/Settings/ProfileScreen';
import PrivacyScreen from '../screens/Settings/PrivacyScreen';
import NotificationsScreen from '../screens/Settings/NotificationsScreen';
import StorageScreen from '../screens/Settings/StorageScreen';
import AboutScreen from '../screens/Settings/AboutScreen';
import LanguageScreen from '../screens/Settings/LanguageScreen';
import ThemeScreen from '../screens/Settings/ThemeScreen';
import BlockedContactsScreen from '../screens/Settings/BlockedContactsScreen';
import AccountScreen from '../screens/Settings/AccountScreen';

import ContactPickerScreen from '../screens/Common/ContactPickerScreen';
import QRCodeScannerScreen from '../screens/Common/QRCodeScannerScreen';
import LocationPickerScreen from '../screens/Common/LocationPickerScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Chat Screens */}
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="MediaPreview" component={MediaPreviewScreen} />
      <Stack.Screen name="StarredMessages" component={StarredMessagesScreen} />
      <Stack.Screen name="SearchMessages" component={SearchMessagesScreen} />

      {/* Status Screens */}
      <Stack.Screen 
        name="StatusView" 
        component={StatusViewScreen}
        options={{ 
          animation: 'fade',
          animationDuration: 500,
        }}
      />
      <Stack.Screen name="CreateStatus" component={CreateStatusScreen} />

      {/* Call Screens */}
      <Stack.Screen 
        name="VoiceCall" 
        component={VoiceCallScreen}
        options={{ 
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen 
        name="VideoCall" 
        component={VideoCallScreen}
        options={{ 
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />

      {/* Settings Screens */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Storage" component={StorageScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="BlockedContacts" component={BlockedContactsScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />

      {/* Common Screens */}
      <Stack.Screen 
        name="ContactPicker" 
        component={ContactPickerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="QRCodeScanner" 
        component={QRCodeScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen 
        name="LocationPicker" 
        component={LocationPickerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
