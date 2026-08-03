import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../config/theme';
import useStore from '../store/store';

import ChatListScreen from '../screens/Chats/ChatListScreen';
import StatusListScreen from '../screens/Status/StatusListScreen';
import CallsListScreen from '../screens/Calls/CallsListScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();
  const { unreadCounts } = useStore();

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-reply-text" size={size} color={color} />
          ),
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.secondary,
            fontSize: 11,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
      <Tab.Screen
        name="Status"
        component={StatusListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Icon name="circle-slice-8" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="phone" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
