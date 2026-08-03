import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { format } from 'date-fns';
import useStore from '../../store/store';
import callService from '../../services/callService';
import Avatar from '../../components/Common/Avatar';
import { useTheme } from '../../config/theme';

const VoiceCallScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { userId, chatId } = route.params;
  
  const [callState, setCallState] = useState('connecting'); // connecting, ringing, ongoing, ended
  const [duration, setDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const { activeCall, endCall, addCall } = useStore();

  useEffect(() => {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Handle back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleEndCall();
        return true;
      }
    );

    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallState('ringing');
      setTimeout(() => {
        setCallState('ongoing');
        startTimer();
      }, 2000);
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timerRef.current);
      backHandler.remove();
      pulseAnim.stopAllListeners();
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

  const handleEndCall = () => {
    setCallState('ended');
    clearInterval(timerRef.current);
    
    // Add call to history
    addCall({
      id: Date.now().toString(),
      callerId: useStore.getState().user?.uid,
      receiverId: userId,
      type: 'voice',
      status: 'ended',
      duration,
      startTime: new Date(Date.now() - duration * 1000).toISOString(),
    });

    // End call
    endCall();
    
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    callService.toggleSpeaker();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    callService.toggleMicrophone();
  };

  const getStatusText = () => {
    switch (callState) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'ongoing':
        return formatDuration(duration);
      case 'ended':
        return 'Call Ended';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#0D3240', '#1A5B43']}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Caller Info */}
          <Animatable.View animation="fadeInDown" delay={300} style={styles.callerInfo}>
            <Animated.View
              style={[
                styles.avatarContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Avatar
                name={userId}
                size={120}
                isOnline={true}
              />
            </Animated.View>
            
            <Text style={styles.callerName}>{userId || 'Contact'}</Text>
            <Text style={styles.callStatus}>{getStatusText()}</Text>
          </Animatable.View>

          {/* Call Controls */}
          {callState === 'ongoing' && (
            <Animatable.View
              animation="fadeInUp"
              delay={500}
              style={styles.controls}
            >
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleToggleSpeaker}
                >
                  <View
                    style={[
                      styles.controlIcon,
                      isSpeakerOn && styles.controlIconActive,
                    ]}
                  >
                    <Icon
                      name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
                      size={28}
                      color={isSpeakerOn ? '#000' : '#fff'}
                    />
                  </View>
                  <Text style={styles.controlLabel}>Speaker</Text>
                </TouchableOpacity>

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
                      size={28}
                      color={isMuted ? '#000' : '#fff'}
                    />
                  </View>
                  <Text style={styles.controlLabel}>Mute</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <View style={styles.controlIcon}>
                    <Icon name="dialpad" size={28} color="#fff" />
                  </View>
                  <Text style={styles.controlLabel}>Keypad</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
                activeOpacity={0.8}
              >
                <Icon name="phone-hangup" size={35} color="#fff" />
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Initial state controls */}
          {(callState === 'connecting' || callState === 'ringing') && (
            <Animatable.View
              animation="fadeInUp"
              delay={800}
              style={styles.connectingControls}
            >
              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
                activeOpacity={0.8}
              >
                <Icon name="phone-hangup" size={35} color="#fff" />
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Call ended state */}
          {callState === 'ended' && (
            <Animatable.View
              animation="fadeInUp"
              delay={300}
              style={styles.endedControls}
            >
              <View style={styles.endedActions}>
                <TouchableOpacity style={styles.endedButton}>
                  <Icon name="message-reply-text" size={28} color="#fff" />
                  <Text style={styles.endedLabel}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.endCallButton, { backgroundColor: '#25D366' }]}
                  onPress={() => {
                    navigation.replace('VoiceCall', { userId });
                  }}
                >
                  <Icon name="phone" size={35} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.endedButton}
                  onPress={() => {
                    navigation.navigate('VideoCall', { userId });
                  }}
                >
                  <Icon name="video" size={28} color="#fff" />
                  <Text style={styles.endedLabel}>Video</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  controls: {
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlIconActive: {
    backgroundColor: '#fff',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  connectingControls: {
    alignItems: 'center',
  },
  endedControls: {
    alignItems: 'center',
  },
  endedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  endedButton: {
    alignItems: 'center',
  },
  endedLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
});

export default VoiceCallScreen;
