import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../config/theme';
import Avatar from '../Common/Avatar';
import useStore from '../../store/store';

const ChatHeader = ({
  chatId,
  chatName,
  onBack,
  onCall,
  onVideoCall,
  onInfo,
}) => {
  const { theme } = useTheme();
  const { onlineUsers, typingUsers } = useStore();

  const isOnline = onlineUsers.has(chatId);
  const isTyping = typingUsers[chatId];

  return (
    <LinearGradient
      colors={[theme.colors.chatHeader, theme.colors.primaryDark]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.chatHeader} />
      
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileSection} onPress={onInfo}>
          <Avatar
            name={chatName}
            size={40}
            isOnline={isOnline}
          />
          
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {chatName}
            </Text>
            <Text style={styles.status} numberOfLines={1}>
              {isTyping
                ? 'typing...'
                : isOnline
                ? 'online'
                : 'last seen recently'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onVideoCall} style={styles.actionButton}>
            <Icon name="video" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onCall} style={styles.actionButton}>
            <Icon name="phone" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onInfo} style={styles.actionButton}>
            <Icon name="dots-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    height: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  status: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionButton: {
    padding: 8,
  },
});

export default ChatHeader;
