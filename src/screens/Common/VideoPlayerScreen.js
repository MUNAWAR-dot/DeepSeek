import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import RNFS from 'react-native-fs';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoPlayerScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { videoUrl, title = 'Video' } = route.params;

  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef(null);

  const togglePlayPause = () => {
    setPaused(!paused);
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, 3000);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleSeek = (value) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: videoUrl,
        message: `Check out this video on ChatsApp!`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fileName = `ChatsApp_Video_${Date.now()}.mp4`;
      const downloadDest = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      await RNFS.downloadFile({
        fromUrl: videoUrl,
        toFile: downloadDest,
      }).promise;

      const CameraRoll = require('@react-native-community/cameraroll');
      await CameraRoll.save(downloadDest, { type: 'video' });
      
      Alert.alert('Success', 'Video saved to gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={showControlsTemporarily}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          resizeMode="contain"
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={() => setPaused(true)}
          repeat={false}
        />

        {/* Play/Pause overlay */}
        {showControls && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Icon
              name={paused ? 'play-circle' : 'pause-circle'}
              size={60}
              color="rgba(255, 255, 255, 0.8)"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Top Controls */}
      <Animated.View style={[styles.topControls, { opacity: opacityAnim }]}>
        {showControls && (
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.controlButton}>
              <Icon name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.topActions}>
              <TouchableOpacity onPress={handleShare} style={styles.controlButton}>
                <Icon name="share-variant" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.controlButton}>
                <Icon name="download" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View style={[styles.bottomControls, { opacity: opacityAnim }]}>
        {showControls && (
          <View style={styles.bottomBar}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                onValueChange={handleSeek}
                minimumTrackTintColor="#25D366"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#25D366"
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.controlRow}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                <Icon
                  name={paused ? 'play' : 'pause'}
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSeek(Math.max(0, currentTime - 10))}
                style={styles.controlButton}
              >
                <Icon name="rewind-10" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSeek(Math.min(duration, currentTime + 10))}
                style={styles.controlButton}
              >
                <Icon name="fast-forward-10" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
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
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
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
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 15,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    padding: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    padding: 15,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
});

export default VideoPlayerScreen;
