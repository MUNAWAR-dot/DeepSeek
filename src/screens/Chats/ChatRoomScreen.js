import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import useStore from '../../store/store';
import ChatHeader from '../../components/Chats/ChatHeader';
import MessageBubble from '../../components/Chats/MessageBubble';
import MessageInput from '../../components/Chats/MessageInput';
import TypingIndicator from '../../components/Chats/TypingIndicator';
import ReplyPreview from '../../components/Chats/ReplyPreview';
import chatService from '../../services/chatService';
import mediaService from '../../services/mediaService';
import { useTheme } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const ChatRoomScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { chatId, chatName } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  
  const flatListRef = useRef(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const recordTimerRef = useRef(null);
  
  const {
    user,
    typingUsers,
    setTypingUser,
    clearTypingUser,
  } = useStore();

  useEffect(() => {
    loadMessages();
    
    return () => {
      // Cleanup
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, [chatId]);

  useEffect(() => {
    // Mark messages as read when chat is opened
    chatService.markMessagesAsRead(chatId);
  }, [chatId, messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const unsub = chatService.subscribeToMessages(chatId, (msgs) => {
        setMessages(msgs);
        setLoading(false);
      });
      
      return () => unsub?.();
    } catch (error) {
      console.error('Load messages failed:', error);
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    
    try {
      setLoadingMore(true);
      const oldestMessage = messages[messages.length - 1];
      const olderMessages = await chatService.loadOlderMessages(
        chatId,
        oldestMessage.timestamp
      );
      
      if (olderMessages.length < 50) {
        setHasMore(false);
      }
      
      setMessages((prev) => [...prev, ...olderMessages]);
    } catch (error) {
      console.error('Load more messages failed:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    try {
      await chatService.sendTextMessage(chatId, text, replyingTo);
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSendImage = async () => {
    try {
      const image = await mediaService.pickImage();
      if (image) {
        await chatService.sendMediaMessage(chatId, image.uri, 'image', image.name);
        scrollToBottom();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleSendVideo = async () => {
    try {
      const video = await mediaService.pickVideo();
      if (video) {
        await chatService.sendMediaMessage(chatId, video.uri, 'video', video.name);
        scrollToBottom();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send video');
    }
  };

  const handleSendDocument = async () => {
    try {
      const doc = await mediaService.pickDocument();
      if (doc) {
        await chatService.sendMediaMessage(chatId, doc.uri, 'document', doc.name);
        scrollToBottom();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send document');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await mediaService.takePhoto();
      if (photo) {
        await chatService.sendMediaMessage(chatId, photo.uri, 'image', photo.name);
        scrollToBottom();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSendLocation = () => {
    navigation.navigate('LocationPicker', {
      onLocationSelect: async (location) => {
        await chatService.sendLocationMessage(chatId, location);
        scrollToBottom();
      },
    });
  };

  const handleSendContact = () => {
    navigation.navigate('ContactPicker', {
      onContactSelect: async (contact) => {
        await chatService.sendContactMessage(chatId, contact);
        scrollToBottom();
      },
    });
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await audioRecorderPlayer.startRecorder();
      
      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Start recording failed:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        setRecordTime(0);
      }
      
      if (result) {
        await chatService.sendAudioMessage(chatId, result, recordTime);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Stop recording failed:', error);
    }
  };

  const handleDeleteMessage = (messageId) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for me',
          onPress: () => chatService.deleteMessage(chatId, messageId, false),
        },
        {
          text: 'Delete for everyone',
          onPress: () => chatService.deleteMessage(chatId, messageId, true),
          style: 'destructive',
        },
      ]
    );
  };

  const handleForwardMessage = (message) => {
    navigation.navigate('ContactPicker', {
      mode: 'forward',
      onContactsSelect: async (contacts) => {
        const chatIds = contacts.map((c) => c.chatId);
        await chatService.forwardMessage(chatId, message.id, chatIds);
      },
    });
  };

  const handleReplyMessage = (message) => {
    setReplyingTo(message);
  };

  const handleStarMessage = (messageId, isStarred) => {
    chatService.toggleStarMessage(chatId, messageId, isStarred);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: 0,
        animated: true,
      });
    }, 100);
  };

  const handleTyping = () => {
    // Emit typing indicator
    // This is handled by the input component
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.senderId === user?.uid;
    const showDate = shouldShowDate(item, index);
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatMessageDate(item.timestamp)}
            </Text>
          </View>
        )}
        <MessageBubble
          message={item}
          isMine={isMine}
          onPress={() => {}}
          onLongPress={() => handleMessageLongPress(item)}
          onReply={() => handleReplyMessage(item)}
          onForward={() => handleForwardMessage(item)}
          onDelete={() => handleDeleteMessage(item.id)}
          onStar={() => handleStarMessage(item.id, !item.isStarred)}
        />
      </View>
    );
  };

  const handleMessageLongPress = (message) => {
    Alert.alert(
      'Message Options',
      '',
      [
        { text: 'Reply', onPress: () => handleReplyMessage(message) },
        { text: 'Forward', onPress: () => handleForwardMessage(message) },
        { text: 'Copy', onPress: () => Clipboard.setString(message.content) },
        { text: 'Star', onPress: () => handleStarMessage(message.id, true) },
        { text: 'Delete', onPress: () => handleDeleteMessage(message.id), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const shouldShowDate = (message, index) => {
    if (index === messages.length - 1) return true;
    const currentDate = new Date(message.timestamp?.toDate?.() || message.timestamp);
    const prevDate = new Date(
      messages[index + 1]?.timestamp?.toDate?.() || messages[index + 1]?.timestamp
    );
    return !isSameDay(currentDate, prevDate);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const formatMessageDate = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return 'Today';
    } else if (diff < 48 * 60 * 60 * 1000) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const isTyping = typingUsers[chatId] && typingUsers[chatId] !== user?.uid;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.chatBackground }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.chatHeader} />
      
      <ChatHeader
        chatId={chatId}
        chatName={chatName}
        onBack={() => navigation.goBack()}
        onCall={() => navigation.navigate('VoiceCall', { chatId })}
        onVideoCall={() => navigation.navigate('VideoCall', { chatId })}
        onInfo={() => navigation.navigate('GroupInfo', { chatId })}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <Animatable.Text animation="pulse" iterationCount="infinite">
                  Loading...
                </Animatable.Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.encryptionNotice}>
              <Icon name="lock" size={12} color="#667781" />
              <Text style={styles.encryptionText}>
                {t('messages.encryptionNotice')}
              </Text>
            </View>
          }
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && <TypingIndicator />}

        {replyingTo && (
          <ReplyPreview
            message={replyingTo}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        <MessageInput
          onSend={handleSendMessage}
          onAttach={() => setShowAttachmentOptions(true)}
          onCamera={handleTakePhoto}
          onRecordingStart={handleStartRecording}
          onRecordingStop={handleStopRecording}
          isRecording={isRecording}
          recordTime={recordTime}
          onTyping={handleTyping}
        />
      </KeyboardAvoidingView>

      {/* Attachment Options Modal */}
      {showAttachmentOptions && (
        <AttachmentOptions
          onClose={() => setShowAttachmentOptions(false)}
          onImage={handleSendImage}
          onVideo={handleSendVideo}
          onDocument={handleSendDocument}
          onLocation={handleSendLocation}
          onContact={handleSendContact}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#667781',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#FAEBD7',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  encryptionText: {
    fontSize: 12,
    color: '#667781',
    textAlign: 'center',
  },
});

export default ChatRoomScreen;
