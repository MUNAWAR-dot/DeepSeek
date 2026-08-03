import { Platform, PermissionsAndroid, Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { APP_CONSTANTS } from '../config/constants';

const audioRecorderPlayer = new AudioRecorderPlayer();

class MediaService {
  // Pick image from gallery
  async pickImage(options = {}) {
    try {
      const image = await ImagePicker.openPicker({
        width: options.width || 1200,
        height: options.height || 1200,
        cropping: options.cropping !== false,
        compressImageMaxWidth: 1200,
        compressImageMaxHeight: 1200,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        includeBase64: false,
        ...options,
      });

      return {
        uri: image.path,
        type: image.mime,
        name: image.filename || `image_${Date.now()}.jpg`,
        size: image.size,
        width: image.width,
        height: image.height,
      };
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Pick image failed:', error);
        throw error;
      }
      return null;
    }
  }

  // Pick video from gallery
  async pickVideo(options = {}) {
    try {
      const video = await ImagePicker.openPicker({
        mediaType: 'video',
        compressVideoPreset: 'MediumQuality',
        ...options,
      });

      // Check video size
      if (video.size > APP_CONSTANTS.MAX_VIDEO_SIZE) {
        throw new Error(
          `Video size exceeds maximum limit of ${
            APP_CONSTANTS.MAX_VIDEO_SIZE / (1024 * 1024)
          }MB`
        );
      }

      return {
        uri: video.path,
        type: video.mime,
        name: video.filename || `video_${Date.now()}.mp4`,
        size: video.size,
        duration: video.duration,
      };
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Pick video failed:', error);
        throw error;
      }
      return null;
    }
  }

  // Take photo with camera
  async takePhoto(options = {}) {
    try {
      const image = await ImagePicker.openCamera({
        width: options.width || 1200,
        height: options.height || 1200,
        cropping: options.cropping !== false,
        compressImageMaxWidth: 1200,
        compressImageMaxHeight: 1200,
        compressImageQuality: 0.8,
        includeBase64: false,
        ...options,
      });

      return {
        uri: image.path,
        type: image.mime,
        name: image.filename || `camera_${Date.now()}.jpg`,
        size: image.size,
        width: image.width,
        height: image.height,
      };
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Take photo failed:', error);
        throw error;
      }
      return null;
    }
  }

  // Record video with camera
  async recordVideo(options = {}) {
    try {
      const video = await ImagePicker.openCamera({
        mediaType: 'video',
        ...options,
      });

      if (video.size > APP_CONSTANTS.MAX_VIDEO_SIZE) {
        throw new Error(
          `Video size exceeds maximum limit of ${
            APP_CONSTANTS.MAX_VIDEO_SIZE / (1024 * 1024)
          }MB`
        );
      }

      return {
        uri: video.path,
        type: video.mime,
        name: video.filename || `video_${Date.now()}.mp4`,
        size: video.size,
        duration: video.duration,
      };
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Record video failed:', error);
        throw error;
      }
      return null;
    }
  }

  // Pick document
  async pickDocument(options = {}) {
    try {
      const result = await DocumentPicker.pick({
        type: options.type || [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const file = result[0];

      // Check file size
      if (file.size > APP_CONSTANTS.MAX_DOCUMENT_SIZE) {
        throw new Error(
          `File size exceeds maximum limit of ${
            APP_CONSTANTS.MAX_DOCUMENT_SIZE / (1024 * 1024)
          }MB`
        );
      }

      return {
        uri: file.fileCopyUri || file.uri,
        type: file.type,
        name: file.name,
        size: file.size,
      };
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Pick document failed:', error);
        throw error;
      }
      return null;
    }
  }

  // Pick multiple images
  async pickMultipleImages(options = {}) {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        maxFiles: options.maxFiles || 10,
        mediaType: 'photo',
        compressImageMaxWidth: 1200,
        compressImageMaxHeight: 1200,
        compressImageQuality: 0.8,
        ...options,
      });

      return images.map((image) => ({
        uri: image.path,
        type: image.mime,
        name: image.filename || `image_${Date.now()}.jpg`,
        size: image.size,
        width: image.width,
        height: image.height,
      }));
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Pick multiple images failed:', error);
        throw error;
      }
      return [];
    }
  }

  // Start audio recording
  async startRecording() {
    try {
      const audioPath = `${
        Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath
      }/audio_${Date.now()}.m4a`;

      const result = await audioRecorderPlayer.startRecorder(audioPath);
      audioRecorderPlayer.addRecordBackListener((e) => {
        // Recording progress callback
        console.log('Recording: ', e.currentPosition);
      });

      return result;
    } catch (error) {
      console.error('Start recording failed:', error);
      throw error;
    }
  }

  // Stop audio recording
  async stopRecording() {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      return {
        uri: result,
        duration: 0, // Calculate from recording start/stop time
      };
    } catch (error) {
      console.error('Stop recording failed:', error);
      throw error;
    }
  }

  // Pause recording
  async pauseRecording() {
    try {
      await audioRecorderPlayer.pauseRecorder();
    } catch (error) {
      console.error('Pause recording failed:', error);
      throw error;
    }
  }

  // Resume recording
  async resumeRecording() {
    try {
      await audioRecorderPlayer.resumeRecorder();
    } catch (error) {
      console.error('Resume recording failed:', error);
      throw error;
    }
  }

  // Start playing audio
  async startPlaying(audioUri) {
    try {
      const msg = await audioRecorderPlayer.startPlayer(audioUri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          console.log('Audio finished playing');
          audioRecorderPlayer.stopPlayer();
        }
      });
      return msg;
    } catch (error) {
      console.error('Start playing failed:', error);
      throw error;
    }
  }

  // Stop playing audio
  async stopPlaying() {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      console.error('Stop playing failed:', error);
      throw error;
    }
  }

  // Pause playing
  async pausePlaying() {
    try {
      await audioRecorderPlayer.pausePlayer();
    } catch (error) {
      console.error('Pause playing failed:', error);
      throw error;
    }
  }

  // Seek audio
  async seekAudio(position) {
    try {
      await audioRecorderPlayer.seekToPlayer(position);
    } catch (error) {
      console.error('Seek audio failed:', error);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(fileUri) {
    try {
      const stat = await RNFS.stat(fileUri);
      const extension = fileUri.split('.').pop()?.toLowerCase();

      let type = 'document';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = 'image';
      } else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
        type = 'video';
      } else if (['mp3', 'wav', 'm4a', 'aac'].includes(extension)) {
        type = 'audio';
      } else if (['pdf'].includes(extension)) {
        type = 'pdf';
      }

      return {
        size: stat.size,
        type,
        extension,
        name: fileUri.split('/').pop(),
        path: fileUri,
      };
    } catch (error) {
      console.error('Get file info failed:', error);
      throw error;
    }
  }

  // Compress image
  async compressImage(imageUri, quality = 0.7) {
    try {
      const compressed = await ImagePicker.openCropper({
        path: imageUri,
        width: 1200,
        height: 1200,
        compressImageQuality: quality,
      });

      return {
        uri: compressed.path,
        size: compressed.size,
      };
    } catch (error) {
      console.error('Compress image failed:', error);
      throw error;
    }
  }

  // Save file to device
  async saveFileToDevice(fileUri, fileName) {
    try {
      const downloadDest = `${
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath
      }/${fileName}`;

      await RNFS.copyFile(fileUri, downloadDest);

      return downloadDest;
    } catch (error) {
      console.error('Save file to device failed:', error);
      throw error;
    }
  }

  // Share file
  async shareFile(fileUri, title = 'Share via ChatsApp') {
    try {
      const Share = require('react-native-share').default;
      
      await Share.open({
        title,
        url: fileUri,
        type: 'application/octet-stream',
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share file failed:', error);
        throw error;
      }
    }
  }

  // Request camera permission
  async requestCameraPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'ChatsApp needs access to your camera to take photos and videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS permissions handled by library
    } catch (error) {
      console.error('Request camera permission failed:', error);
      return false;
    }
  }

  // Request storage permission
  async requestStoragePermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'ChatsApp needs access to your storage to share files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Request storage permission failed:', error);
      return false;
    }
  }

  // Request microphone permission
  async requestMicrophonePermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'ChatsApp needs access to your microphone for voice messages and calls.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Request microphone permission failed:', error);
      return false;
    }
  }
}

export default new MediaService();
