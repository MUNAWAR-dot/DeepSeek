import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import userService from '../../services/userService';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const NewChatScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useStore();
  
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const phoneContacts = await userService.getPhoneContacts();
      const syncedContacts = await userService.syncContacts(phoneContacts);
      setContacts(syncedContacts.filter(c => c.isAppUser && c.appUserId !== user?.uid));
    } catch (error) {
      console.error('Load contacts failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    
    if (text.length >= 2) {
      setSearching(true);
      try {
        const results = await userService.searchUsers(text);
        setSearchResults(results.filter(u => u.id !== user?.uid));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleContactPress = async (contact) => {
    try {
      const chat = await chatService.createChat([contact.id || contact.appUserId]);
      navigation.replace('ChatRoom', {
        chatId: chat.id,
        chatName: contact.displayName || contact.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  const handleNewGroup = () => {
    navigation.navigate('ContactPicker', {
      mode: 'newGroup',
      onContactsSelect: async (selectedContacts) => {
        const participantIds = selectedContacts.map(c => c.appUserId);
        try {
          const chat = await chatService.createChat(participantIds, true, {
            name: 'New Group',
          });
          navigation.replace('GroupInfo', { chatId: chat.id });
        } catch (error) {
          Alert.alert('Error', 'Failed to create group');
        }
      },
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#667781" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name or number"
          placeholderTextColor="#667781"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#667781" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" duration={300} delay={index * 30}>
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: theme.colors.card }]}
        onPress={() => handleContactPress(item)}
      >
        <Avatar
          uri={item.photoURL || item.thumbnailPath}
          name={item.displayName || item.name}
          size={50}
        />
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: theme.colors.text }]}>
            {item.displayName || item.name}
          </Text>
          {item.status && (
            <Text style={[styles.contactStatus, { color: theme.colors.textSecondary }]}>
              {item.status}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {renderHeader()}

      <TouchableOpacity
        style={[styles.groupButton, { backgroundColor: theme.colors.card }]}
        onPress={handleNewGroup}
      >
        <View style={styles.groupIcon}>
          <Icon name="account-group" size={24} color="#fff" />
        </View>
        <Text style={[styles.groupText, { color: theme.colors.text }]}>
          New Group
        </Text>
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {searchQuery.length >= 2 ? 'Search Results' : 'Contacts on ChatsApp'}
      </Text>

      <FlatList
        data={searchQuery.length >= 2 ? searchResults : contacts.filter(c => c.isAppUser)}
        keyExtractor={(item) => item.id || item.appUserId || item.phoneNumber}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery.length >= 2
                ? 'No results found'
                : 'No contacts on ChatsApp yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#075E54',
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 13,
  },
  separator: {
    height: 0.5,
    marginLeft: 77,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default NewChatScreen;
