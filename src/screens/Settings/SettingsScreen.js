// src/screens/Settings/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

export default function SettingsScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  const settingsOptions = [
    { 
      title: '👤 Profile', 
      onPress: () => navigation.navigate('Profile') 
    },
    { 
      title: '🔒 Privacy', 
      onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon') 
    },
    { 
      title: '🔔 Notifications', 
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon') 
    },
    { 
      title: '🌐 Language', 
      onPress: () => Alert.alert('Language', 'Language settings coming soon') 
    },
    { 
      title: '🎨 Theme', 
      onPress: () => Alert.alert('Theme', 'Theme settings coming soon') 
    },
    { 
      title: 'ℹ️ About', 
      onPress: () => Alert.alert('About', 'ChatsApp v1.0.0\nBuilt with React Native') 
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={item.onPress}
          >
            <Text style={styles.optionText}>{item.title}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#ff3b30',
    marginHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});
