import { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '../store/store';
import chatService from '../services/chatService';

export const useChat = (chatId) => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setActiveChat,
    clearTypingUser,
  } = useStore();

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    setActiveChat(chatId);

    unsubscribeRef.current = chatService.subscribeToMessages(chatId, (msgs) => {
      setMessages(chatId, msgs);
      setLoading(false);
    });

    // Mark messages as read
    chatService.markMessagesAsRead(chatId);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      setActiveChat(null);
      clearTypingUser(chatId);
    };
  }, [chatId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const chatMessages = messages[chatId] || [];
      
      if (chatMessages.length > 0) {
        const oldestMessage = chatMessages[chatMessages.length - 1];
        const olderMessages = await chatService.loadOlderMessages(
          chatId,
          oldestMessage.timestamp
        );

        if (olderMessages.length < 50) {
          setHasMore(false);
        }

        setMessages(chatId, [...chatMessages, ...olderMessages]);
      }
    } catch (error) {
      console.error('Load more messages failed:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, hasMore, loadingMore, messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;
    
    try {
      await chatService.sendTextMessage(chatId, text);
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }, [chatId]);

  const sendMedia = useCallback(async (fileUri, type, fileName) => {
    try {
      await chatService.sendMediaMessage(chatId, fileUri, type, fileName);
    } catch (error) {
      console.error('Send media failed:', error);
      throw error;
    }
  }, [chatId]);

  const sendAudio = useCallback(async (audioUri, duration) => {
    try {
      await chatService.sendAudioMessage(chatId, audioUri, duration);
    } catch (error) {
      console.error('Send audio failed:', error);
      throw error;
    }
  }, [chatId]);

  const deleteMsg = useCallback(async (messageId, forEveryone = false) => {
    try {
      await chatService.deleteMessage(chatId, messageId, forEveryone);
    } catch (error) {
      console.error('Delete message failed:', error);
      throw error;
    }
  }, [chatId]);

  return {
    messages: messages[chatId] || [],
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage,
    sendMedia,
    sendAudio,
    deleteMessage: deleteMsg,
  };
};
