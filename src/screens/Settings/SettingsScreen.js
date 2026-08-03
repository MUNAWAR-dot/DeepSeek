import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      navigation.navigate('Login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const settingsOptions = [
    { title: 'Profile', onPress: () => navigation.navigate('Profile') },
    { title: 'Privacy', onPress: () => navigation.navigate('Privacy') },
    { title: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { title: 'Language', onPress: () => navigation.navigate('Language') },
    { title: 'Theme', onPress: () => navigation.navigate('Theme') },
    { title: 'About', onPress: () => navigation.navigate('About') },
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
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

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
});

export default SettingsScreen;
