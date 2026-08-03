// src/screens/Status/StatusScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';

const API_URL = 'https://chatsapp-g0dr.onrender.com';

export default function StatusScreen({ navigation }) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      // Fetch statuses from API
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/statuses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      } else {
        // Mock data if API not ready
        setStatuses([
          { id: 1, user: 'John Doe', time: '5 min ago', viewed: false },
          { id: 2, user: 'Jane Smith', time: '30 min ago', viewed: true },
          { id: 3, user: 'Mike Johnson', time: '2 hours ago', viewed: false },
        ]);
      }
    } catch (error) {
      console.log('Error loading statuses:', error);
      // Mock data on error
      setStatuses([
        { id: 1, user: 'John Doe', time: '5 min ago', viewed: false },
        { id: 2, user: 'Jane Smith', time: '30 min ago', viewed: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = ({ item }) => (
    <TouchableOpacity style={styles.statusItem}>
      <View style={[styles.avatar, item.viewed ? styles.viewed : styles.unviewed]}>
        <Text style={styles.avatarText}>
          {item.user ? item.user.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.statusInfo}>
        <Text style={styles.userName}>{item.user || 'Unknown'}</Text>
        <Text style={styles.timeText}>{item.time || 'Just now'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateStatus')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={statuses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStatus}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No status updates</Text>
            <Text style={styles.emptySubText}>Tap + to add your first status</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  viewed: {
    backgroundColor: '#ccc',
  },
  unviewed: {
    backgroundColor: '#007AFF',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
