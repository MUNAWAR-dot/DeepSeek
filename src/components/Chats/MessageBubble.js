import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { format } from 'date-fns';
import { useTheme } from '../../config/theme';
import { APP_CONSTANTS } from '../../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

const MessageBubble = memo(
  ({
    message,
    isMine,
    onPress,
    onLongPress,
    onReply,
    onForward,
    onDelete,
    onStar,
  }) => {
    const { theme } = useTheme();

    const renderTextMessage = () => (
      <View style={styles.textContainer}>
        {message.replyTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replyName} numberOfLines={1}>
                {message.replyTo.senderName || 'User'}
              </Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {message.replyTo.content}
              </Text>
            </View>
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            { color: isMine ? '#075E54' : theme.colors.text },
            message.isForwarded && styles.forwardedText,
          ]}
          selectable
        >
          {message.content}
        </Text>
        {message.edited && (
          <Text style={styles.editedText}>edited</Text>
        )}
      </View>
    );

    const renderImageMessage = () => (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <FastImage
          source={{ uri: message.fileUrl }}
          style={[
            styles.imageMessage,
            {
              width: Math.min(message.width || MAX_BUBBLE_WIDTH, MAX_BUBBLE_WIDTH),
              height: Math.min(
                message.height || 300,
                300
              ),
            },
          ]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );

    const renderVideoMessage = () => (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.videoContainer}>
          <FastImage
            source={{ uri: message.thumbnail || message.fileUrl }}
            style={[
              styles.videoMessage,
              {
                width: Math.min(MAX_BUBBLE_WIDTH, 280),
                height: 200,
              },
            ]}
            resizeMode="cover"
          />
          <View style={styles.playButton}>
            <Icon name="play-circle" size={50} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );

    const renderAudioMessage = () => (
      <View style={styles.audioContainer}>
        <TouchableOpacity style={styles.playPauseButton}>
          <Icon name="play" size={30} color={isMine ? '#075E54' : '#25D366'} />
        </TouchableOpacity>
        <View style={styles.audioWaveform}>
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
          <View style={styles.waveformBar} />
        </View>
        <Text style={[styles.audioDuration, { color: isMine ? '#075E54' : theme.colors.textSecondary }]}>
          {formatDuration(message.duration || 0)}
        </Text>
      </View>
    );

    const renderDocumentMessage = () => (
      <TouchableOpacity style={styles.documentContainer} onPress={onPress}>
        <View style={styles.documentIcon}>
          <Icon name="file-document" size={30} color="#075E54" />
        </View>
        <View style={styles.documentInfo}>
          <Text
            style={[styles.documentName, { color: isMine ? '#075E54' : theme.colors.text }]}
            numberOfLines={1}
          >
            {message.fileName}
          </Text>
          <Text style={styles.documentSize}>
            {formatFileSize(message.fileSize || 0)}
          </Text>
        </View>
        <Icon name="download" size={24} color="#667781" />
      </TouchableOpacity>
    );

    const renderLocationMessage = () => (
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => {
          if (message.location) {
            Linking.openURL(
              `https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`
            );
          }
        }}
      >
        <View style={styles.locationHeader}>
          <Icon name="map-marker" size={20} color="#FF3B30" />
          <Text style={styles.locationTitle} numberOfLines={1}>
            {message.location?.name || 'Location'}
          </Text>
        </View>
        <Text style={styles.locationAddress} numberOfLines={2}>
          {message.location?.address || 'Shared location'}
        </Text>
        <View style={styles.locationMapPlaceholder}>
          <Text style={styles.locationMapText}>📍 Shared Location</Text>
        </View>
      </TouchableOpacity>
    );

    const renderContactMessage = () => (
      <TouchableOpacity style={styles.contactContainer} onPress={onPress}>
        <View style={styles.contactAvatar}>
          <Icon name="account" size={30} color="#075E54" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: isMine ? '#075E54' : theme.colors.text }]}>
            {message.contact?.name}
          </Text>
          <Text style={styles.contactPhone}>
            {message.contact?.phoneNumber}
          </Text>
        </View>
        <TouchableOpacity style={styles.contactAction}>
          <Icon name="message-plus" size={20} color="#25D366" />
        </TouchableOpacity>
      </TouchableOpacity>
    );

    const renderSystemMessage = () => (
      <View style={styles.systemMessage}>
        <Icon name="information" size={14} color="#667781" />
        <Text style={styles.systemMessageText}>
          {getSystemMessageText(message)}
        </Text>
      </View>
    );

    const getSystemMessageText = (msg) => {
      switch (msg.systemType) {
        case 'group_created':
          return 'Group created';
        case 'member_added':
          return 'Member added to group';
        case 'member_removed':
          return 'Member removed from group';
        case 'member_left':
          return 'Member left the group';
        case 'group_updated':
          return 'Group info updated';
        case 'admin_added':
          return 'New admin added';
        case 'admin_removed':
          return 'Admin removed';
        default:
          return msg.content || 'System message';
      }
    };

    const renderMessageContent = () => {
      switch (message.type) {
        case 'text':
          return renderTextMessage();
        case 'image':
          return renderImageMessage();
        case 'video':
          return renderVideoMessage();
        case 'audio':
          return renderAudioMessage();
        case 'document':
          return renderDocumentMessage();
        case 'location':
          return renderLocationMessage();
        case 'contact':
          return renderContactMessage();
        case 'system':
          return renderSystemMessage();
        default:
          return renderTextMessage();
      }
    };

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    if (message.type === 'system') {
      return renderSystemMessage();
    }

    return (
      <Animatable.View
        animation={isMine ? 'fadeInRight' : 'fadeInLeft'}
        duration={300}
        style={[
          styles.container,
          isMine ? styles.mineContainer : styles.theirContainer,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.8}
          style={[
            styles.bubble,
            isMine
              ? [styles.mineBubble, { backgroundColor: theme.colors.sentMessageBubble }]
              : [styles.theirBubble, { backgroundColor: theme.colors.receivedMessageBubble }],
          ]}
        >
          {renderMessageContent()}

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                {
                  color: isMine
                    ? 'rgba(7, 94, 84, 0.7)'
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {format(
                message.timestamp?.toDate?.() || new Date(message.timestamp),
                'h:mm a'
              )}
            </Text>

            {isMine && (
              <Icon
                name={
                  message.status === 'read'
                    ? 'check-all'
                    : message.status === 'delivered'
                    ? 'check-all'
                    : 'check'
                }
                size={14}
                color={
                  message.status === 'read'
                    ? '#34B7F1'
                    : 'rgba(7, 94, 84, 0.7)'
                }
                style={styles.statusIcon}
              />
            )}

            {message.isForwarded && (
              <Icon
                name="share"
                size={12}
                color={isMine ? 'rgba(7, 94, 84, 0.7)' : theme.colors.textSecondary}
                style={styles.forwardedIcon}
              />
            )}
          </View>

          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <View style={styles.reactionsContainer}>
              {Object.values(message.reactions).map((reaction, index) => (
                <Text key={index} style={styles.reactionEmoji}>
                  {reaction}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {message.isStarred && (
          <Icon
            name="star"
            size={14}
            color="#FFD700"
            style={styles.starIcon}
          />
        )}
      </Animatable.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  mineContainer: {
    alignSelf: 'flex-end',
  },
  theirContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 8,
    padding: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  mineBubble: {
    borderTopRightRadius: 2,
  },
  theirBubble: {
    borderTopLeftRadius: 2,
  },
  textContainer: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  forwardedText: {
    fontStyle: 'italic',
  },
  editedText: {
    fontSize: 11,
    color: '#667781',
    fontStyle: 'italic',
    marginTop: 2,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  replyBar: {
    width: 3,
    backgroundColor: '#25D366',
    borderRadius: 2,
    marginRight: 6,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#25D366',
  },
  replyText: {
    fontSize: 12,
    color: '#667781',
  },
  imageMessage: {
    borderRadius: 5,
    marginBottom: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  videoMessage: {
    borderRadius: 5,
    marginBottom: 4,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 200,
  },
  playPauseButton: {
    marginRight: 8,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#25D366',
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
    marginLeft: 8,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 250,
  },
  documentIcon: {
    marginRight: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 12,
    color: '#667781',
  },
  locationContainer: {
    padding: 4,
    minWidth: 200,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#075E54',
  },
  locationAddress: {
    fontSize: 12,
    color: '#667781',
    marginBottom: 4,
  },
  locationMapPlaceholder: {
    height: 100,
    backgroundColor: '#E8F5E8',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMapText: {
    fontSize: 16,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 200,
  },
  contactAvatar: {
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 12,
    color: '#667781',
  },
  contactAction: {
    padding: 5,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#667781',
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 2,
  },
  forwardedIcon: {
    marginLeft: 2,
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -10,
    right: -5,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  reactionEmoji: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  starIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});

export default MessageBubble;
