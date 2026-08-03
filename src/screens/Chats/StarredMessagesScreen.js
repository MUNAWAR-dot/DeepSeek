import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { format } from 'date-fns';
import chatService from '../../services/chatService';
import { useTheme } from '../../config/theme';

const StarredMessagesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStarredMessages();
  }, []);

  const loadStarredMessages = async () => {
    try {
      setLoading(true);
      const starred = await chatService.getStarredMessages();
      setMessages(starred);
    } catch (error) {
      console.error('Load starred messages failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstar = async (messageId) => {
    try {
      await chatService.toggleStarMessage(
        messages.find(m => m.id === messageId)?.chatId,
        messageId,
        false
      );
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Unstar message failed:', error);
    }
  };

  const handleMessagePress = (message) => {
    navigation.navigate('ChatRoom', {
      chatId: message.chatId,
      scrollToMessage: message.id,
    });
  };

  const renderMessage = ({ item, index }) => (
    <Animatable.View animation="fadeInRight" duration={300} delay={index * 30}>
      <TouchableOpacity
        style={[styles.messageItem, { backgroundColor: theme.colors.card }]}
        onPress={() => handleMessagePress(item)}
        onLongPress={() => {
          Alert.alert(
            'Message Options',
            '',
            [
              {
                text: 'Unstar',
                onPress: () => handleUnstar(item.id),
                style: 'destructive',
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={styles.starIcon}>
          <Icon name="star" size={20} color="#FFD700" />
        </View>
        
        <View style={styles.messageContent}>
          <Text style={[styles.senderName, { color: theme.colors.text }]}>
            {item.senderId}
          </Text>
          <Text
            style={[styles.messageText, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.content || `${item.type} message`}
          </Text>
        </View>

        <View style={styles.messageTime}>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {format(
              item.timestamp?.toDate?.() || new Date(item.timestamp),
              'dd/MM/yyyy'
            )}
          </Text>
        </View>
      </TouchableOpacity>
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
          Starred Messages
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {messages.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="star-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No starred messages
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Tap and hold on any message to star it
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
        />
      )}
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
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  starIcon: {
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    marginLeft: 10,
  },
  timeText: {
    fontSize: 12,
  },
  separator: {
    height: 0.5,
    marginLeft: 47,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
});

export default StarredMessagesScreen;
