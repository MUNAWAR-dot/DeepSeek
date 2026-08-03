// src/screens/Calls/CallsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const API_URL = 'https://chatsapp-g0dr.onrender.com';

export default function CallsScreen() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      } else {
        // Mock data if API not ready
        setCalls([
          { id: 1, name: 'John Doe', time: '10:30 AM', type: 'incoming', missed: false },
          { id: 2, name: 'Jane Smith', time: '9:15 AM', type: 'outgoing', missed: false },
          { id: 3, name: 'Mike Johnson', time: 'Yesterday', type: 'incoming', missed: true },
        ]);
      }
    } catch (error) {
      console.log('Error loading calls:', error);
      // Mock data on error
      setCalls([
        { id: 1, name: 'John Doe', time: '10:30 AM', type: 'incoming', missed: false },
        { id: 2, name: 'Jane Smith', time: '9:15 AM', type: 'outgoing', missed: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderCall = ({ item }) => (
    <TouchableOpacity style={styles.callItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.callInfo}>
        <Text style={styles.userName}>{item.name || 'Unknown'}</Text>
        <Text style={[styles.callType, item.missed && styles.missedCall]}>
          {item.type === 'incoming' ? '📞 Incoming' : '📞 Outgoing'} • {item.time || 'Just now'}
        </Text>
      </View>
      {item.missed && (
        <View style={styles.missedBadge}>
          <Text style={styles.missedText}>Missed</Text>
        </View>
      )}
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
        <Text style={styles.headerTitle}>Calls</Text>
      </View>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCall}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No call history</Text>
            <Text style={styles.emptySubText}>Your calls will appear here</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  callItem: {
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  callInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  callType: {
    fontSize: 14,
    color: '#666',
  },
  missedCall: {
    color: '#ff3b30',
  },
  missedBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
