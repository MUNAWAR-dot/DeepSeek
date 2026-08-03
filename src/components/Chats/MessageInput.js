import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../config/theme';

const MessageInput = ({
  onSend,
  onAttach,
  onCamera,
  onRecordingStart,
  onRecordingStop,
  isRecording,
  recordTime,
  onTyping,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const inputRef = useRef(null);
  const recordingAnim = useRef(new Animated.Value(0)).current;

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.clear();
    }
  }, [message, onSend]);

  const handleTextChange = (text) => {
    setMessage(text);
    if (text.length > 0) {
      onTyping?.();
    }
  };

  const handleAttachPress = () => {
    Alert.alert(
      'Attach',
      'Choose attachment type',
      [
        { text: 'Document', onPress: () => onAttach?.('document') },
        { text: 'Camera', onPress: () => onCamera?.() },
        { text: 'Gallery', onPress: () => onAttach?.('gallery') },
        { text: 'Audio', onPress: () => onAttach?.('audio') },
        { text: 'Location', onPress: () => onAttach?.('location') },
        { text: 'Contact', onPress: () => onAttach?.('contact') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatRecordTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.chatInput }]}>
      {isRecording ? (
        <Animatable.View animation="slideInRight" duration={300} style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              style={styles.recordingDot}
            />
            <Text style={styles.recordingTime}>
              {formatRecordTime(recordTime)}
            </Text>
          </View>
          <Text style={styles.recordingText}>Recording audio...</Text>
          <TouchableOpacity
            style={styles.stopRecordingButton}
            onPress={onRecordingStop}
          >
            <Icon name="stop" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachPress}
          >
            <Icon
              name="paperclip"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={[styles.textInputWrapper, isFocused && styles.textInputFocused]}>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: theme.colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textSecondary}
              value={message}
              onChangeText={handleTextChange}
              multiline
              maxLength={5000}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          {message.trim().length > 0 ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.7}
            >
              <Animatable.View animation="bounceIn" duration={300}>
                <Icon name="send" size={24} color="#25D366" />
              </Animatable.View>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onCamera}
              >
                <Icon name="camera" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onLongPress={onRecordingStart}
                onPressOut={onRecordingStop}
              >
                <Icon name="microphone" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 8,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textInputFocused: {
    borderColor: '#25D366',
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
  },
  sendButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: '#667781',
    marginLeft: 10,
  },
  stopRecordingButton: {
    padding: 8,
  },
});

export default MessageInput;
