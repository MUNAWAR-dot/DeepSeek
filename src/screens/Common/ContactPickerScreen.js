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
import { useTranslation } from 'react-i18next';
import useStore from '../../store/store';
import Avatar from '../../components/Common/Avatar';
import userService from '../../services/userService';
import { useTheme } from '../../config/theme';

const ContactPickerScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { mode = 'newChat', onContactSelect, onContactsSelect } = route.params || {};
  
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isMultiSelect, setIsMultiSelect] = useState(mode === 'newGroup');

  const { user } = useStore();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      // Load phone contacts and find which ones are on ChatsApp
      const phoneContacts = await userService.getPhoneContacts();
      const syncedContacts = await userService.syncContacts(phoneContacts);
      setContacts(syncedContacts.filter(c => c.isAppUser && c.appUserId !== user?.uid));
    } catch (error) {
      console.error('Load contacts failed:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phoneNumber?.includes(searchQuery)
    );
  });

  const handleContactPress = (contact) => {
    if (isMultiSelect) {
      toggleContactSelection(contact);
    } else {
      handleSingleSelect(contact);
    }
  };

  const handleSingleSelect = (contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
      navigation.goBack();
    } else {
      // Navigate to chat with this contact
      navigation.navigate('ChatRoom', {
        chatId: contact.appUserId,
        chatName: contact.name,
      });
    }
  };

  const toggleContactSelection = (contact) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contact.appUserId)) {
      newSelected.delete(contact.appUserId);
    } else {
      newSelected.add(contact.appUserId);
    }
    setSelectedContacts(newSelected);
  };

  const handleDone = () => {
    const selectedList = contacts.filter(c => selectedContacts.has(c.appUserId));
    if (selectedList.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    if (onContactsSelect) {
      onContactsSelect(selectedList);
      navigation.goBack();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isMultiSelect ? 'Select Contacts' : 'New Chat'}
        </Text>
        {isMultiSelect && (
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isMultiSelect && selectedContacts.size > 0 && (
        <Text style={[styles.selectedCount, { color: theme.colors.textSecondary }]}>
          {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} selected
        </Text>
      )}
    </View>
  );

  const renderContact = ({ item, index }) => {
    const isSelected = selectedContacts.has(item.appUserId);

    return (
      <Animatable.View
        animation="fadeInRight"
        duration={300}
        delay={index * 30}
      >
        <TouchableOpacity
          style={[styles.contactItem, { backgroundColor: theme.colors.card }]}
          onPress={() => handleContactPress(item)}
          activeOpacity={0.7}
        >
          <Avatar
            uri={item.thumbnailPath}
            name={item.name}
            size={50}
          />
          
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
              {item.phoneNumber}
            </Text>
          </View>

          {isMultiSelect && (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Icon name="check" size={16} color="#fff" />}
            </View>
          )}

          {!isMultiSelect && (
            <Icon name="message-plus" size={22} color={theme.colors.textSecondary} />
          )}
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderEmpty = () => (
    <Animatable.View animation="fadeIn" delay={500} style={styles.emptyContainer}>
      <Icon name="account-group-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No contacts found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Invite your friends to join ChatsApp
      </Text>
      <TouchableOpacity style={styles.inviteButton}>
        <Icon name="share-variant" size={20} color="#fff" />
        <Text style={styles.inviteButtonText}>Invite Friends</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      {renderHeader()}

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.appUserId || item.phoneNumber}
        renderItem={renderContact}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filteredContacts.length === 0 && styles.emptyList}
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
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
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
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    padding: 5,
  },
  doneText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  selectedCount: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 5,
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
  contactPhone: {
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  separator: {
    height: 0.5,
    marginLeft: 77,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactPickerScreen;
