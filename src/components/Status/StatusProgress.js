import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const StatusProgress = ({ total, current, duration = 5000, paused = false, onComplete }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    startProgress();
    return () => clearTimeout(timerRef.current);
  }, [current, paused]);

  const startProgress = () => {
    progressAnim.setValue(0);

    if (!paused) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }).start(() => {
        onComplete?.();
      });
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={styles.barContainer}>
          <Animated.View
            style={[
              styles.bar,
              index < current
                ? { width: '100%' }
                : index === current
                ? {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                : { width: '0%' },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    gap: 3,
  },
  barContainer: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
});

export default StatusProgress;
