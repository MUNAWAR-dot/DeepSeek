import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    Animated.sequence([
      // Scale logo
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fade in title
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Fade in subtitle
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Animate loading bar
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const loadingWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#075E54', '#128C7E', '#25D366']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#075E54" />
      
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: logoScale }] },
          ]}
        >
          <View style={styles.logoCircle}>
            <Icon name="chat" size={60} color="#fff" />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          ChatsApp
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Connect with friends and family worldwide
        </Animated.Text>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                { width: loadingWidth },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>From</Text>
        <Text style={styles.footerBrand}>ChatsApp Inc.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SplashScreen;
