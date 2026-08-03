import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImageViewerScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { imageUrl, images = [], initialIndex = 0 } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const [saving, setSaving] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const imageList = images.length > 0 ? images : [{ url: imageUrl }];
  const currentImage = imageList[currentIndex];

  const toggleControls = () => {
    if (showControls) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowControls(false));
    } else {
      setShowControls(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (currentIndex < imageList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: currentImage.url,
        message: 'Check out this image on ChatsApp!',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fileName = `ChatsApp_${Date.now()}.jpg`;
      const downloadDest = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      await RNFS.downloadFile({
        fromUrl: currentImage.url,
        toFile: downloadDest,
      }).promise;

      // Save to gallery
      const CameraRoll = require('@react-native-community/cameraroll');
      await CameraRoll.save(downloadDest, { type: 'photo' });
      
      Alert.alert('Success', 'Image saved to gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete image logic
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <FastImage
          source={{ uri: currentImage?.url }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Navigation arrows */}
      {imageList.length > 1 && showControls && (
        <>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.leftArrow]}
              onPress={handlePrevious}
            >
              <Icon name="chevron-left" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          {currentIndex < imageList.length - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.rightArrow]}
              onPress={handleNext}
            >
              <Icon name="chevron-right" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Top Controls */}
      <Animated.View style={[styles.topControls, { opacity: opacityAnim }]}>
        {showControls && (
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.controlButton}>
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            {imageList.length > 1 && (
              <Text style={styles.counter}>
                {currentIndex + 1} / {imageList.length}
              </Text>
            )}

            <View style={styles.topActions}>
              <TouchableOpacity onPress={handleShare} style={styles.controlButton}>
                <Icon name="share-variant" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.controlButton}>
                <Icon name="delete" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View style={[styles.bottomControls, { opacity: opacityAnim }]}>
        {showControls && (
          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Icon name="download" size={24} color="#fff" />
              <Text style={styles.saveText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    left: 15,
  },
  rightArrow: {
    right: 15,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
  },
  topActions: {
    flexDirection: 'row',
    gap: 15,
  },
  controlButton: {
    padding: 8,
  },
  counter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ImageViewerScreen;
