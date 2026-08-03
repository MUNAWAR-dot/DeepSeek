import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const ProgressBar = ({
  progress = 0,
  color = '#25D366',
  backgroundColor = '#E0E0E0',
  height = 4,
  animated = true,
  style,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(progress);
    }
  }, [progress, animated]);

  const width = animated
    ? widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
      })
    : `${Math.min(progress, 100)}%`;

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.progress,
          {
            width: animated ? width : `${progress}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ProgressBar;
