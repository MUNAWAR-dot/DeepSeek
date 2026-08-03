import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';

const StatusScreen = ({ navigation }) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load statuses from API
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      // Replace with your actual API call
      // const response = await statusAPI.getAll();
      // setStatuses(response.data);
      
      // Temporary mock data
      setStatuses([
        { id: 1, user: 'John Doe', time: '5 min ago', viewed: true },
        { id: 2, user: 'Jane Smith', time: '30 min ago', viewed: false },
        { id: 3, user: 'Mike Johnson', time: '2 hours ago', viewed: true },
      ]);
    } catch (error) {
      console.log('Error loading statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = ({ item }) => (
    <TouchableOpacity style={styles.statusItem}>
      <View style={[styles.avatar, item.viewed ? styles.viewed : styles.unviewed]}>
        <Text style={styles.avatarText}>
          {item.user.charAt(0)}
        </Text>
      </View>
      <View style={styles.statusInfo}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
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
      </View>

      <FlatList
        data={statuses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStatus}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No status updates</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateStatus')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  statusItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default StatusScreen;
