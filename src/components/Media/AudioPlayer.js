import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useTheme } from '../../config/theme';

const AudioPlayer = ({ audioUrl, duration: initialDuration, isMine }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [hasError, setHasError] = useState(false);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const playCountRef = useRef(0);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  const startPlaying = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      await audioRecorderPlayer.startPlayer(audioUrl);
      setIsPlaying(true);

      audioRecorderPlayer.addPlayBackListener((e) => {
        setCurrentPosition(e.currentPosition);
        setDuration(e.duration);

        if (e.currentPosition === e.duration) {
          setIsPlaying(false);
          setCurrentPosition(0);
          audioRecorderPlayer.stopPlayer();
        }
      });
    } catch (error) {
      console.error('Start playing failed:', error);
      setHasError(true);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const pausePlaying = async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause playing failed:', error);
    }
  };

  const resumePlaying = async () => {
    try {
      await audioRecorderPlayer.resumePlayer();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume playing failed:', error);
    }
  };

  const handleSeek = async (value) => {
    try {
      await audioRecorderPlayer.seekToPlayer(value);
      setCurrentPosition(value);
    } catch (error) {
      console.error('Seek failed:', error);
    }
  };

  const handleTogglePlay = () => {
    if (hasError) {
      startPlaying();
      return;
    }

    if (isPlaying) {
      pausePlaying();
    } else {
      if (currentPosition > 0) {
        resumePlaying();
      } else {
        startPlaying();
      }
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleTogglePlay}
        style={styles.playButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isMine ? '#075E54' : '#25D366'} />
        ) : (
          <Icon
            name={isPlaying ? 'pause' : hasError ? 'reload' : 'play'}
            size={28}
            color={isMine ? '#075E54' : '#25D366'}
          />
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentPosition}
          onValueChange={handleSeek}
          minimumTrackTintColor={isMine ? '#075E54' : '#25D366'}
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor={isMine ? '#075E54' : '#25D366'}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: isMine ? '#075E54' : theme.colors.textSecondary }]}>
            {formatTime(currentPosition)}
          </Text>
          <Text style={[styles.timeText, { color: isMine ? '#075E54' : theme.colors.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {isPlaying && (
        <View style={styles.waveformContainer}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveformBar,
                {
                  backgroundColor: isMine ? '#075E54' : '#25D366',
                  height: Math.random() * 20 + 5,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 200,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 11,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginLeft: 8,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
});

export default AudioPlayer;
