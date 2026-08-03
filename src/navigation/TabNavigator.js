// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import ChatsScreen from '../screens/Chats/ChatListScreen';
import StatusScreen from '../screens/Status/StatusScreen';
import CallsScreen from '../screens/Calls/CallsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

// Temporary icons until you add icons
const getTabIcon = (icon) => ({ focused }) => (
  <Text style={{ fontSize: 24, color: focused ? '#007AFF' : '#999' }}>
    {icon}
  </Text>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{
          tabBarIcon: getTabIcon('💬'),
        }}
      />
      <Tab.Screen 
        name="Status" 
        component={StatusScreen}
        options={{
          tabBarIcon: getTabIcon('📷'),
        }}
      />
      <Tab.Screen 
        name="Calls" 
        component={CallsScreen}
        options={{
          tabBarIcon: getTabIcon('📞'),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: getTabIcon('⚙️'),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
