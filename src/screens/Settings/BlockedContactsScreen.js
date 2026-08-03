import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const BlockedContactsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useStore();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      console.error('Load blocked users failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (userId) => {
    Alert.alert(
      'Unblock Contact',
      'Are you sure you want to unblock this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await userService.unblockUser(userId);
              setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock contact');
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" duration={300} delay={index * 30}>
      <View style={[styles.userItem, { backgroundColor: theme.colors.card }]}>
        <Avatar
          uri={item.photoURL}
          name={item.displayName}
          size={50}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {item.displayName || 'Unknown'}
          </Text>
          <Text style={[styles.userStatus, { color: theme.colors.textSecondary }]}>
            Blocked
          </Text>
        </View>
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={() => handleUnblock(item.id)}
        >
          <Text style={styles.unblockText}>Unblock</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  const renderEmpty = () => (
    <Animatable.View animation="fadeIn" delay={500} style={styles.emptyContainer}>
      <Icon name="shield-check" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Blocked Contacts
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Blocked contacts will appear here
      </Text>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Blocked Contacts
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={blockedUsers.length === 0 && styles.emptyList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 13,
  },
  unblockButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  unblockText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    marginLeft: 77,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 10,
  },
});

export default BlockedContactsScreen;
