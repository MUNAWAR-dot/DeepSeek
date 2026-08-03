import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AttachmentOptions = ({
  visible,
  onClose,
  onImage,
  onVideo,
  onDocument,
  onLocation,
  onContact,
  onCamera,
}) => {
  const { theme } = useTheme();

  const options = [
    {
      icon: 'camera',
      label: 'Camera',
      color: '#E91E63',
      onPress: () => {
        onClose();
        onCamera?.();
      },
    },
    {
      icon: 'image',
      label: 'Gallery',
      color: '#9C27B0',
      onPress: () => {
        onClose();
        onImage?.();
      },
    },
    {
      icon: 'video',
      label: 'Video',
      color: '#FF5722',
      onPress: () => {
        onClose();
        onVideo?.();
      },
    },
    {
      icon: 'file-document',
      label: 'Document',
      color: '#2196F3',
      onPress: () => {
        onClose();
        onDocument?.();
      },
    },
    {
      icon: 'map-marker',
      label: 'Location',
      color: '#4CAF50',
      onPress: () => {
        onClose();
        onLocation?.();
      },
    },
    {
      icon: 'account',
      label: 'Contact',
      color: '#00BCD4',
      onPress: () => {
        onClose();
        onContact?.();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animatable.View
          animation="slideInUp"
          duration={300}
          style={[styles.container, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.handle} />
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Share
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <Animatable.View
                  key={index}
                  animation="bounceIn"
                  delay={index * 100}
                >
                  <TouchableOpacity
                    style={styles.option}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${option.color}20` },
                      ]}
                    >
                      <Icon name={option.icon} size={28} color={option.color} />
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 20,
  },
  option: {
    alignItems: 'center',
    width: 70,
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AttachmentOptions;
