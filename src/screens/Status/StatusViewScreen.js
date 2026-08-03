import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import statusService from '../../services/statusService';
import Avatar from '../../components/Common/Avatar';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StatusViewScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { userId, statuses, isMyStatus } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const currentStatus = statuses?.[currentIndex];
  const totalStatuses = statuses?.length || 0;

  useEffect(() => {
    startProgress();
    return () => clearInterval(timerRef.current);
  }, [currentIndex, paused]);

  const startProgress = () => {
    clearInterval(timerRef.current);
    progressAnim.setValue(0);

    if (!paused) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(() => {
        handleNext();
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < totalStatuses - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleTouchStart = () => {
    setPaused(true);
  };

  const handleTouchEnd = () => {
    setPaused(false);
  };

  const handleDelete = async () => {
    if (isMyStatus && currentStatus) {
      await statusService.deleteStatus(currentStatus.id);
      if (totalStatuses === 1) {
        navigation.goBack();
      } else {
        const newStatuses = statuses.filter((_, i) => i !== currentIndex);
        if (currentIndex >= newStatuses.length) {
          setCurrentIndex(newStatuses.length - 1);
        }
      }
    }
  };

  const renderProgressBars = () => (
    <View style={styles.progressContainer}>
      {statuses?.map((_, index) => (
        <View key={index} style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width:
                  index < currentIndex
                    ? '100%'
                    : index === currentIndex
                    ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    : '0%',
              },
            ]}
          />
        </View>
      ))}
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['rgba(0,0,0,0.6)', 'transparent']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Avatar
            uri={currentStatus?.userAvatar}
            name={currentStatus?.userName || 'User'}
            size={40}
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>{currentStatus?.userName || 'User'}</Text>
            <Text style={styles.timestamp}>
              {currentStatus?.createdAt
                ? new Date(
                    currentStatus.createdAt?.toDate?.() || currentStatus.createdAt
                  ).toLocaleTimeString()
                : ''}
            </Text>
          </View>
        </View>

        {isMyStatus && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Icon name="delete" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="dots-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  if (!currentStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
          No status to display
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPressIn={handleTouchStart}
        onPressOut={handleTouchEnd}
      >
        {renderProgressBars()}
        {renderHeader()}

        <View style={styles.mediaContainer}>
          {currentStatus.type === 'image' && (
            <FastImage
              source={{ uri: currentStatus.mediaUrl }}
              style={styles.media}
              resizeMode="contain"
            />
          )}
          {currentStatus.type === 'video' && (
            <View style={styles.media}>
              <Text style={{ color: '#fff' }}>Video Player</Text>
            </View>
          )}

          {currentStatus.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{currentStatus.caption}</Text>
            </View>
          )}
        </View>

        {/* Navigation areas */}
        <View style={styles.navigationAreas}>
          <TouchableOpacity
            style={styles.leftArea}
            onPress={handlePrevious}
            activeOpacity={0}
          />
          <TouchableOpacity
            style={styles.rightArea}
            onPress={handleNext}
            activeOpacity={0}
          />
        </View>

        {/* Bottom actions */}
        {isMyStatus && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.viewsButton}>
              <Icon name="eye" size={20} color="#fff" />
              <Text style={styles.viewsCount}>
                {currentStatus.viewers?.length || 0} views
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 10,
    gap: 3,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    padding: 5,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  navigationAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftArea: {
    flex: 1,
  },
  rightArea: {
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  viewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewsCount: {
    color: '#fff',
    fontSize: 14,
  },
});

export default StatusViewScreen;
