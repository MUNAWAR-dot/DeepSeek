import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';
import statusService from '../../services/statusService';
import mediaService from '../../services/mediaService';
import { useTheme } from '../../config/theme';

const CreateStatusScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const image = await mediaService.pickImage();
      if (image) {
        setSelectedMedia(image);
        setMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await mediaService.takePhoto();
      if (photo) {
        setSelectedMedia(photo);
        setMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickVideo = async () => {
    try {
      const video = await mediaService.pickVideo();
      if (video) {
        setSelectedMedia(video);
        setMediaType('video');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handlePost = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select media first');
      return;
    }

    try {
      setLoading(true);
      await statusService.createStatus(
        selectedMedia.uri,
        mediaType,
        caption
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Status Privacy',
      'Who can see my status?',
      [
        { text: 'My Contacts', onPress: () => {} },
        { text: 'My Contacts Except...', onPress: () => {} },
        { text: 'Only Share With...', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('status.addStatus')}
        </Text>
        <TouchableOpacity onPress={handlePrivacy}>
          <Icon name="lock-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {!selectedMedia ? (
        <Animatable.View animation="fadeInUp" delay={300} style={styles.pickerContainer}>
          <View style={styles.pickerOptions}>
            <TouchableOpacity
              style={[styles.pickerOption, { backgroundColor: '#E8F5E8' }]}
              onPress={handleTakePhoto}
            >
              <Icon name="camera" size={40} color="#25D366" />
              <Text style={styles.pickerOptionText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerOption, { backgroundColor: '#E3F2FD' }]}
              onPress={handlePickImage}
            >
              <Icon name="image" size={40} color="#2196F3" />
              <Text style={styles.pickerOptionText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerOption, { backgroundColor: '#FFF3E0' }]}
              onPress={handlePickVideo}
            >
              <Icon name="video" size={40} color="#FF9800" />
              <Text style={styles.pickerOptionText}>Video</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.privacyNote, { color: theme.colors.textSecondary }]}>
            Your status will be visible to your contacts for 24 hours
          </Text>
        </Animatable.View>
      ) : (
        <Animatable.View animation="fadeIn" duration={500} style={styles.previewContainer}>
          {mediaType === 'image' && (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          {mediaType === 'video' && (
            <View style={styles.previewVideo}>
              <Text style={{ color: '#fff' }}>Video Preview</Text>
            </View>
          )}

          <View style={styles.captionContainer}>
            <TextInput
              style={[styles.captionInput, { color: theme.colors.text }]}
              placeholder="Add a caption..."
              placeholderTextColor={theme.colors.textSecondary}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => {
                setSelectedMedia(null);
                setCaption('');
              }}
            >
              <Icon name="refresh" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.buttonDisabled]}
              onPress={handlePost}
              disabled={loading}
            >
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animatable.View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    flex: 1,
    padding: 20,
  },
  pickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  pickerOption: {
    width: 100,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#075E54',
  },
  privacyNote: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewVideo: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    padding: 15,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 50,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  changeButton: {
    padding: 10,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CreateStatusScreen;
