import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const CallsScreen = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      // Replace with your actual API call
      // const response = await callsAPI.getAll();
      // setCalls(response.data);
      
      // Temporary mock data
      setCalls([
        { id: 1, name: 'John Doe', time: '10:30 AM', type: 'incoming', missed: false },
        { id: 2, name: 'Jane Smith', time: '9:15 AM', type: 'outgoing', missed: false },
        { id: 3, name: 'Mike Johnson', time: 'Yesterday', type: 'incoming', missed: true },
      ]);
    } catch (error) {
      console.log('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCall = ({ item }) => (
    <TouchableOpacity style={styles.callItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.callInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={[styles.callType, item.missed && styles.missedCall]}>
          {item.type === 'incoming' ? '📞 Incoming' : '📞 Outgoing'} • {item.time}
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
          <Text style={styles.emptyText}>No call history</Text>
        }
      />
    </View>
  );
};

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
    color: 'red',
  },
  missedBadge: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missedText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default CallsScreen;
