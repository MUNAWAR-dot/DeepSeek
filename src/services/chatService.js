import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { uploadFile } from './firebase';
import { emitMessage, emitTypingStart, emitTypingStop, emitMessageRead } from './socket';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../store/store';

class ChatService {
  constructor() {
    this.unsubscribeChats = null;
    this.unsubscribeMessages = {};
  }

  // Subscribe to user's chats
  subscribeToChats(callback) {
    const userId = auth().currentUser?.uid;
    if (!userId) return () => {};

    this.unsubscribeChats = firestore()
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTime', 'desc')
      .onSnapshot(
        (snapshot) => {
          const chats = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              chats.push({ id: change.doc.id, ...change.doc.data() });
            } else if (change.type === 'modified') {
              const index = chats.findIndex((c) => c.id === change.doc.id);
              if (index !== -1) {
                chats[index] = { id: change.doc.id, ...change.doc.data() };
              } else {
                chats.push({ id: change.doc.id, ...change.doc.data() });
              }
            } else if (change.type === 'removed') {
              const index = chats.findIndex((c) => c.id === change.doc.id);
              if (index !== -1) {
                chats.splice(index, 1);
              }
            }
          });
          
          // Sort by lastMessageTime
          chats.sort((a, b) => {
            const timeA = a.lastMessageTime?.toMillis() || 0;
            const timeB = b.lastMessageTime?.toMillis() || 0;
            return timeB - timeA;
          });
          
          callback(chats);
        },
        (error) => {
          console.error('Chats subscription error:', error);
          callback([]);
        }
      );

    return this.unsubscribeChats;
  }

  // Subscribe to messages of a specific chat
  subscribeToMessages(chatId, callback) {
    if (this.unsubscribeMessages[chatId]) {
      this.unsubscribeMessages[chatId]();
    }

    this.unsubscribeMessages[chatId] = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const messages = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              messages.unshift({ id: change.doc.id, ...change.doc.data() });
            } else if (change.type === 'modified') {
              const index = messages.findIndex((m) => m.id === change.doc.id);
              if (index !== -1) {
                messages[index] = { id: change.doc.id, ...change.doc.data() };
              }
            } else if (change.type === 'removed') {
              const index = messages.findIndex((m) => m.id === change.doc.id);
              if (index !== -1) {
                messages.splice(index, 1);
              }
            }
          });
          
          callback(messages);
        },
        (error) => {
          console.error('Messages subscription error:', error);
          callback([]);
        }
      );

    return this.unsubscribeMessages[chatId];
  }

  // Load older messages
  async loadOlderMessages(chatId, lastMessageTimestamp) {
    try {
      const snapshot = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .startAfter(lastMessageTimestamp)
        .limit(50)
        .get();

      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      return messages;
    } catch (error) {
      console.error('Load older messages failed:', error);
      throw error;
    }
  }

  // Create a new chat
  async createChat(participantIds, isGroup = false, groupData = null) {
    try {
      const currentUserId = auth().currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const allParticipants = [...new Set([currentUserId, ...participantIds])];

      const chatData = {
        participants: allParticipants,
        isGroup,
        createdBy: currentUserId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        isArchived: false,
        isPinned: false,
        isMuted: false,
        mutedUntil: null,
        unreadCount: {},
      };

      if (isGroup) {
        chatData.groupName = groupData?.name || 'New Group';
        chatData.groupDescription = groupData?.description || '';
        chatData.groupIcon = null;
        chatData.groupAdmins = [currentUserId];
        chatData.participantDetails = allParticipants.map((id) => ({
          userId: id,
          isAdmin: id === currentUserId,
          joinedAt: firestore.FieldValue.serverTimestamp(),
        }));
      }

      // Initialize unread count for all participants
      allParticipants.forEach((id) => {
        if (id !== currentUserId) {
          chatData.unreadCount[id] = 0;
        }
      });

      const chatRef = await firestore().collection('chats').add(chatData);
      
      // Send system message for group creation
      if (isGroup) {
        await this.sendSystemMessage(chatRef.id, 'group_created', {
          createdBy: currentUserId,
          groupName: chatData.groupName,
        });
      }

      return { id: chatRef.id, ...chatData };
    } catch (error) {
      console.error('Create chat failed:', error);
      throw error;
    }
  }

  // Send a text message
  async sendTextMessage(chatId, text, replyTo = null) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messageId = uuidv4();
      const timestamp = firestore.FieldValue.serverTimestamp();

      const messageData = {
        id: messageId,
        chatId,
        senderId: userId,
        type: 'text',
        content: text,
        timestamp,
        status: 'sending',
        reactions: {},
        isForwarded: false,
        ...(replyTo && { replyTo }),
      };

      // Optimistically add message to store
      const store = useStore.getState();
      store.addMessage(chatId, { ...messageData, timestamp: new Date().toISOString() });

      // Send via socket for real-time delivery
      emitMessage(messageData);

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set({
          ...messageData,
          status: 'sent',
        });

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      return messageData;
    } catch (error) {
      console.error('Send text message failed:', error);
      throw error;
    }
  }

  // Send media message
  async sendMediaMessage(chatId, fileUri, type, fileName = null) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messageId = uuidv4();
      const fileExtension = fileName?.split('.').pop() || 'jpg';
      const uploadPath = `chats/${chatId}/media/${messageId}.${fileExtension}`;

      // Upload file to storage
      const fileUrl = await uploadFile(fileUri, uploadPath);

      const messageData = {
        id: messageId,
        chatId,
        senderId: userId,
        type,
        content: '',
        fileUrl,
        fileName: fileName || `file.${fileExtension}`,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        reactions: {},
        isForwarded: false,
      };

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      // Send via socket
      emitMessage(messageData);

      return messageData;
    } catch (error) {
      console.error('Send media message failed:', error);
      throw error;
    }
  }

  // Send audio message
  async sendAudioMessage(chatId, audioUri, duration) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messageId = uuidv4();
      const uploadPath = `chats/${chatId}/audio/${messageId}.m4a`;

      // Upload audio to storage
      const fileUrl = await uploadFile(audioUri, uploadPath);

      const messageData = {
        id: messageId,
        chatId,
        senderId: userId,
        type: 'audio',
        content: '',
        fileUrl,
        fileName: 'Voice Message',
        duration,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        reactions: {},
        isForwarded: false,
      };

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      // Send via socket
      emitMessage(messageData);

      return messageData;
    } catch (error) {
      console.error('Send audio message failed:', error);
      throw error;
    }
  }

  // Send location message
  async sendLocationMessage(chatId, location) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messageId = uuidv4();

      const messageData = {
        id: messageId,
        chatId,
        senderId: userId,
        type: 'location',
        content: '',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name || 'Location',
          address: location.address || '',
        },
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        reactions: {},
        isForwarded: false,
      };

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      // Send via socket
      emitMessage(messageData);

      return messageData;
    } catch (error) {
      console.error('Send location message failed:', error);
      throw error;
    }
  }

  // Send contact message
  async sendContactMessage(chatId, contact) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const messageId = uuidv4();

      const messageData = {
        id: messageId,
        chatId,
        senderId: userId,
        type: 'contact',
        content: '',
        contact: {
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          email: contact.email || '',
          photoURL: contact.photoURL || null,
        },
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        reactions: {},
        isForwarded: false,
      };

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      // Send via socket
      emitMessage(messageData);

      return messageData;
    } catch (error) {
      console.error('Send contact message failed:', error);
      throw error;
    }
  }

  // Send system message
  async sendSystemMessage(chatId, type, data) {
    try {
      const messageId = uuidv4();

      const messageData = {
        id: messageId,
        chatId,
        senderId: 'system',
        type: 'system',
        content: '',
        systemType: type,
        systemData: data,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
      };

      // Save to Firestore
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .set(messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, messageData);

      return messageData;
    } catch (error) {
      console.error('Send system message failed:', error);
      throw error;
    }
  }

  // Update chat's last message
  async updateChatLastMessage(chatId, message) {
    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .update({
          lastMessage: {
            id: message.id,
            type: message.type,
            content: message.content,
            senderId: message.senderId,
          },
          lastMessageTime: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Update chat last message failed:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Get unread messages
      const snapshot = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .where('senderId', '!=', userId)
        .where('status', '!=', 'read')
        .get();

      const batch = firestore().batch();
      const messageIds = [];

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: firestore.FieldValue.serverTimestamp(),
        });
        messageIds.push(doc.id);
      });

      await batch.commit();

      // Clear unread count
      await firestore()
        .collection('chats')
        .doc(chatId)
        .update({
          [`unreadCount.${userId}`]: 0,
        });

      // Emit read status via socket
      if (messageIds.length > 0) {
        emitMessageRead(chatId, messageIds);
      }
    } catch (error) {
      console.error('Mark messages as read failed:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(chatId, messageId, deleteForEveryone = false) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      if (deleteForEveryone) {
        // Delete message completely
        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(messageId)
          .delete();

        // Emit delete via socket
        if (socket?.connected) {
          socket.emit('message:delete', {
            messageId,
            chatId,
            deleteForEveryone: true,
          });
        }
      } else {
        // Mark as deleted for this user only
        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(messageId)
          .update({
            [`deletedFor.${userId}`]: true,
          });
      }
    } catch (error) {
      console.error('Delete message failed:', error);
      throw error;
    }
  }

  // Edit message
  async editMessage(chatId, messageId, newContent) {
    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .update({
          content: newContent,
          edited: true,
          editedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Emit edit via socket
      if (socket?.connected) {
        socket.emit('message:edit', {
          messageId,
          chatId,
          content: newContent,
        });
      }
    } catch (error) {
      console.error('Edit message failed:', error);
      throw error;
    }
  }

  // Forward message
  async forwardMessage(sourceChatId, messageId, targetChatIds) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Get original message
      const messageDoc = await firestore()
        .collection('chats')
        .doc(sourceChatId)
        .collection('messages')
        .doc(messageId)
        .get();

      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }

      const originalMessage = messageDoc.data();

      // Forward to multiple chats
      const forwardPromises = targetChatIds.map(async (chatId) => {
        const newMessageId = uuidv4();
        const newMessage = {
          ...originalMessage,
          id: newMessageId,
          chatId,
          senderId: userId,
          timestamp: firestore.FieldValue.serverTimestamp(),
          status: 'sent',
          isForwarded: true,
          originalSenderId: originalMessage.senderId,
          reactions: {},
          replyTo: null,
        };

        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .doc(newMessageId)
          .set(newMessage);

        await this.updateChatLastMessage(chatId, newMessage);

        // Emit via socket
        emitMessage(newMessage);
      });

      await Promise.all(forwardPromises);
    } catch (error) {
      console.error('Forward message failed:', error);
      throw error;
    }
  }

  // Add reaction to message
  async addReaction(chatId, messageId, reaction) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .update({
          [`reactions.${userId}`]: reaction,
        });
    } catch (error) {
      console.error('Add reaction failed:', error);
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(chatId, messageId) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(messageId)
        .update({
          [`reactions.${userId}`]: firestore.FieldValue.delete(),
        });
    } catch (error) {
      console.error('Remove reaction failed:', error);
      throw error;
    }
  }

  // Star/Unstar message
  async toggleStarMessage(chatId, messageId, isStarred) {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      if (isStarred) {
        // Add to starred messages collection
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('starredMessages')
          .doc(messageId)
          .set({
            chatId,
            messageId,
            starredAt: firestore.FieldValue.serverTimestamp(),
          });
      } else {
        // Remove from starred messages
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('starredMessages')
          .doc(messageId)
          .delete();
      }
    } catch (error) {
      console.error('Toggle star message failed:', error);
      throw error;
    }
  }

  // Get starred messages
  async getStarredMessages() {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const snapshot = await firestore()
        .collection('users')
        
