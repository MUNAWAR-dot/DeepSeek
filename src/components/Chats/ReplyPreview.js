import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../config/theme';

const ReplyPreview = ({ message, onCancel }) => {
  const { theme } = useTheme();

  if (!message) return null;

  const getPreviewText = () => {
    switch (message.type) {
      case 'text':
        return message.content;
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Voice message';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      case 'contact':
        return '👤 Contact';
      default:
        return message.content || 'Message';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.replyBar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.replyTo}>
            Replying to {message.senderName || 'User'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Icon name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.previewText, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {getPreviewText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  replyBar: {
    width: 3,
    backgroundColor: '#25D366',
    borderRadius: 2,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  replyTo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#25D366',
  },
  cancelButton: {
    padding: 4,
  },
  previewText: {
    fontSize: 14,
  },
});

export default ReplyPreview;
