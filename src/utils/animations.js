import { Animated, Easing } from 'react-native';

export const fadeIn = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

export const fadeOut = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

export const slideInUp = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

export const slideInDown = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

export const slideInLeft = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

export const slideInRight = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

export const scaleIn = (value, duration = 300) => {
  return Animated.spring(value, {
    toValue: 1,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  });
};

export const scaleOut = (value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

export const pulse = (value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

export const shake = (value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

export const rotate = (value) => {
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

export const createAnimatedValue = (initialValue = 0) => {
  return new Animated.Value(initialValue);
};

export const interpolateColor = (value, inputRange, outputRange) => {
  return value.interpolate({
    inputRange,
    outputRange,
  });
};

export const parallel = (animations) => {
  return Animated.parallel(animations);
};

export const sequence = (animations) => {
  return Animated.sequence(animations);
};

export const stagger = (time, animations) => {
  return Animated.stagger(time, animations);
};

export const delay = (time) => {
  return Animated.delay(time);
};
