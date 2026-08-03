import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import useStore from '../../store/store';
import ChatListItem from '../../components/Chats/ChatListItem';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const ChatListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  
  const searchAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    chats,
    setChats,
    setChatLoading,
    onlineUsers,
    unreadCounts,
    user,
  } = useStore();

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = chatService.subscribeToChats((updatedChats) => {
        setChats(updatedChats);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Data refreshes automatically via subscription
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const toggleSearch = () => {
    if (searchBarVisible) {
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setSearchBarVisible(false);
        setSearchQuery('');
      });
    } else {
      setSearchBarVisible(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 100 && fabVisible) {
          setFabVisible(false);
          Animated.spring(fabAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else if (offsetY <= 100 && !fabVisible) {
          setFabVisible(true);
          Animated.spring(fabAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    }
  );

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();

    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(searchLower);
    }

    return true; // You would search by participant names
  });

  const getTotalUnread = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  const handleChatPress = (chat) => {
    navigation.navigate('ChatRoom', { 
      chatId: chat.id,
      chatName: chat.isGroup ? chat.groupName : 'Contact',
    });
  };

  const renderRightActions = (progress, dragX, chat) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.archiveAction]}
          onPress={() => {
            chatService.updateChatSettings(chat.id, { isArchived: true });
          }}
        >
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <Icon name="archive" size={24} color="#fff" />
            <Text style={styles.swipeActionText}>Archive</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.swipeAction, styles.muteAction]}
          onPress={() => {
            // Toggle mute
          }}
        >
          <Icon name={chat.isMuted ? 'volume-high' : 'volume-off'} size={24} color="#fff" />
          <Text style={styles.swipeActionText}>
            {chat.isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => {
            // Confirm delete
            Alert.alert(
              'Delete Chat',
              'Are you sure you want to delete this chat?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => chatService.deleteChat(chat.id),
                },
              ]
            );
          }}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <Animatable.View animation="fadeInDown" duration={500} style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>ChatsApp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleSearch} style={styles.headerIcon}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewChat')}
            style={styles.headerIcon}
          >
            <Icon name="message-plus" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerIcon}
          >
            <Icon name="dots-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {searchBarVisible && (
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchAnim,
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="magnify" size={20} color="#667781" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('chats.searchChats')}
            placeholderTextColor="#667781"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#667781" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </Animatable.View>
  );

  const renderEmptyList = () => (
    <Animatable.View animation="fadeIn" delay={500} style={styles.emptyContainer}>
      <Icon name="chat-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {t('chats.noChats')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {t('chats.startChat')}
      </Text>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate('NewChat')}
      >
        <Icon name="message-plus" size={20} color="#fff" />
        <Text style={styles.startChatButtonText}>Start New Chat</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {renderHeader()}

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ChatListItem
            chat={item}
            index={index}
            onPress={() => handleChatPress(item)}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, item)
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={filteredChats.length === 0 && styles.emptyList}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
      />

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              {
                scale: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
            opacity: fabAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('NewChat')}
          activeOpacity={0.8}
        >
          <Icon name="message-plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Unread messages badge */}
      {getTotalUnread() > 0 && (
        <TouchableOpacity style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {getTotalUnread()} new message{getTotalUnread() > 1 ? 's' : ''}
          </Text>
          <Icon name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#075E54',
  },
  separator: {
    height: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  unreadBadge: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  unreadText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
  swipeActions: {
    flexDirection: 'row',
    height: '100%',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  archiveAction: {
    backgroundColor: '#128C7E',
  },
  muteAction: {
    backgroundColor: '#34B7F1',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default ChatListScreen;
