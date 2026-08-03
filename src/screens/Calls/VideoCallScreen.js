import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  BackHandler,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import useStore from '../../store/store';
import callService from '../../services/callService';
import Avatar from '../../components/Common/Avatar';
import { useTheme } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoCallScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { userId, chatId } = route.params;
  
  const [callState, setCallState] = useState('connecting');
  const [duration, setDuration] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showControls, setShowControls] = useState(true);
  
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const { activeCall, endCall, addCall } = useStore();

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallState('ringing');
      setTimeout(() => {
        setCallState('ongoing');
        startTimer();
      }, 2000);
    }, 1500);

    // Back handler
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleEndCall();
        return true;
      }
    );

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timerRef.current);
      clearTimeout(hideControlsTimer.current);
      backHandler.remove();
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScreenPress = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsWithTimer();
    }
  };

  const showControlsWithTimer = () => {
    setShowControls(true);
    Animated.timing(controlsAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      hideControls();
    }, 5000);
  };

  const hideControls = () => {
    Animated.timing(controlsAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  const handleEndCall = () => {
    setCallState('ended');
    clearInterval(timerRef.current);
    
    addCall({
      id: Date.now().toString(),
      callerId: useStore.getState().user?.uid,
      receiverId: userId,
      type: 'video',
      status: 'ended',
      duration,
      startTime: new Date(Date.now() - duration * 1000).toISOString(),
    });

    endCall();
    
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    callService.toggleCamera();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    callService.toggleMicrophone();
  };

  const handleSwitchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    callService.switchCamera();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleScreenPress}
      >
        {/* Remote video (main view) */}
        <View style={styles.remoteVideo}>
          {callState === 'ongoing' ? (
            <View style={styles.videoPlaceholder}>
              <Icon name="video" size={80} color="rgba(255,255,255,0.3)" />
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Avatar name={userId} size={100} />
              <Text style={styles.callerName}>{userId || 'Contact'}</Text>
              <Text style={styles.callStatus}>
                {callState === 'connecting' ? 'Connecting...' : 'Ringing...'}
              </Text>
            </View>
          )}
        </View>

        {/* Local video (picture-in-picture) */}
        {callState === 'ongoing' && isCameraOn && (
          <TouchableOpacity
            style={styles.localVideo}
            onPress={handleSwitchCamera}
            activeOpacity={0.8}
          >
            <View style={styles.localVideoPlaceholder}>
              <Icon name="account" size={30} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Call duration */}
        {callState === 'ongoing' && showControls && (
          <View style={styles.durationContainer}>
            <View style={styles.durationBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.durationText}>
                {formatDuration(duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <Animated.View
          style={[
            styles.controlsContainer,
            {
              opacity: controlsAnim,
              transform: [
                {
                  translateY: controlsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {callState === 'ongoing' && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleToggleMute}
              >
                <View
                  style={[
                    styles.controlIcon,
                    isMuted && styles.controlIconActive,
                  ]}
                >
                  <Icon
                    name={isMuted ? 'microphone-off' : 'microphone'}
                    size={24}
                    color={isMuted ? '#000' : '#fff'}
                  />
                </View>
                <Text style={styles.controlLabel}>Mute</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
                activeOpacity={0.8}
              >
                <Icon name="phone-hangup" size={30} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleToggleCamera}
              >
                <View
                  style={[
                    styles.controlIcon,
                    !isCameraOn && styles.controlIconActive,
                  ]}
                >
                  <Icon
                    name={isCameraOn ? 'video' : 'video-off'}
                    size={24}
                    color={!isCameraOn ? '#000' : '#fff'}
                  />
                </View>
                <Text style={styles.controlLabel}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleSwitchCamera}
              >
                <View style={styles.controlIcon}>
                  <Icon name="camera-flip" size={24} color="#fff" />
                </View>
                <Text style={styles.controlLabel}>Flip</Text>
              </TouchableOpacity>
            </View>
          )}

          {(callState === 'connecting' || callState === 'ringing') && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
                activeOpacity={0.8}
              >
                <Icon name="phone-hangup" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
  localVideo: {
    position: 'absolute',
    top: 50,
    right: 15,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  controlIconActive: {
    backgroundColor: '#fff',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 11,
  },
  endCallButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default VideoCallScreen;
