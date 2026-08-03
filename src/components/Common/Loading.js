import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Loading = ({ message = 'Loading...', size = 'large', color = '#25D366' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation for icon
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Dot animations
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => animateDots());
    };

    if (message) {
      animateDots();
    }
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconSize = size === 'large' ? 40 : size === 'medium' ? 30 : 20;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon name="loading" size={iconSize} color={color} />
      </Animated.View>

      {message && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot1.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot2.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot3.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    color: '#667781',
    marginRight: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#667781',
  },
});

export default Loading;
