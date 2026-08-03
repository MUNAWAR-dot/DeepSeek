import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import useStore from '../../store/store';
import { useTheme } from '../../config/theme';
import Avatar from '../Common/Avatar';

const ChatListItem = memo(({ chat, index, onPress }) => {
  const { theme } = useTheme();
  const { user, onlineUsers, typingUsers, unreadCounts } = useStore();

  const getOtherParticipant = () => {
    if (chat.isGroup) {
      return {
        name: chat.groupName || 'Group',
        avatar: chat.groupIcon,
        isGroup: true,
        participantCount: chat.participants?.length || 0,
      };
    }

    const otherId = chat.participants?.find((p) => p !== user?.uid);
    return {
      id: otherId,
      name: otherId, // This would be fetched from users collection
      avatar: null,
      isGroup: false,
    };
  };

  const participant = getOtherParticipant();
  const isOnline = !participant.isGroup && onlineUsers.has(participant.id);
  const unreadCount = unreadCounts[chat.id] || 0;
  const isTyping = typingUsers[chat.id] && typingUsers[chat.id] !== user?.uid;

  const getMessagePreview = () => {
    if (isTyping) return 'typing...';
    if (!chat.lastMessage) return '';

    const { type, content, senderId } = chat.lastMessage;
    const isMine = senderId === user?.uid;
    const prefix = isMine ? 'You: ' : '';

    switch (type) {
      case 'text':
        return `${prefix}${content}`;
      case 'image':
        return `${prefix}📷 Image`;
      case 'video':
        return `${prefix}🎥 Video`;
      case 'audio':
        return `${prefix}🎵 Voice message`;
      case 'document':
        return `${prefix}📄 Document`;
      case 'location':
        return `${prefix}📍 Location`;
      case 'contact':
        return `${prefix}👤 Contact`;
      case 'sticker':
        return `${prefix}🎯 Sticker`;
      default:
        return `${prefix}${content}`;
    }
  };

  const getMessageTime = () => {
    if (!chat.lastMessageTime) return '';
    
    const date = chat.lastMessageTime?.toDate?.() || new Date(chat.lastMessageTime);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return format(date, 'h:mm a');
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEE');
    } else {
      return format(date, 'dd/MM/yy');
    }
  };

  const getStatusIcon = () => {
    if (!chat.lastMessage || chat.lastMessage.senderId !== user?.uid) return null;

    switch (chat.lastMessage.status) {
      case 'sending':
        return <Icon name="clock" size={14} color="#667781" />;
      case 'sent':
        return <Icon name="check" size={16} color="#667781" />;
      case 'delivered':
        return <Icon name="check-all" size={16} color="#667781" />;
      case 'read':
        return <Icon name="check-all" size={16} color="#34B7F1" />;
      case 'failed':
        return <Icon name="alert-circle" size={14} color="#FF3B30" />;
      default:
        return null;
    }
  };

  return (
    <Animatable.View
      animation="fadeInRight"
      duration={500}
      delay={index * 50}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: theme.colors.card },
          chat.isPinned && styles.pinnedContainer,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar
            uri={participant.avatar}
            name={participant.name}
            size={50}
            isOnline={isOnline}
            isGroup={participant.isGroup}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text
                style={[
                  styles.name,
                  { color: theme.colors.text },
                  unreadCount > 0 && styles.unreadName,
                ]}
                numberOfLines={1}
              >
                {participant.name}
              </Text>
              {participant.isGroup && (
                <Text style={styles.participantCount}>
                  ({participant.participantCount})
                </Text>
              )}
            </View>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
              {getMessageTime()}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.messageContainer}>
              {getStatusIcon()}
              <Text
                style={[
                  styles.message,
                  { color: theme.colors.textSecondary },
                  unreadCount > 0 && styles.unreadMessage,
                  isTyping && styles.typingMessage,
                ]}
                numberOfLines={1}
              >
                {getMessagePreview()}
              </Text>
            </View>

            <View style={styles.rightIcons}>
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : (
                <>
                  {chat.isMuted && (
                    <Icon name="volume-off" size={14} color={theme.colors.textSecondary} />
                  )}
                  {chat.isPinned && (
                    <Icon
                      name="pin"
                      size={14}
                      color={theme.colors.textSecondary}
                      style={styles.pinIcon}
                    />
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 15,
  },
  pinnedContainer: {
    backgroundColor: '#F0FFF0',
  },
  avatarContainer: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadName: {
    fontWeight: 'bold',
    color: '#075E54',
  },
  participantCount: {
    fontSize: 14,
    color: '#667781',
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#075E54',
  },
  typingMessage: {
    color: '#25D366',
    fontStyle: 'italic',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pinIcon: {
    marginLeft: 2,
  },
});

export default ChatListItem;
