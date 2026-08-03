import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../config/theme';

const Avatar = ({ uri, name, size = 50, isOnline, isGroup, style }) => {
  const { theme } = useTheme();
  
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const getBackgroundColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {uri ? (
        <FastImage
          source={{ uri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getBackgroundColor(name),
            },
          ]}
        >
          {isGroup ? (
            <Text style={[styles.groupIcon, { fontSize: size * 0.4 }]}>
              👥
            </Text>
          ) : (
            <Text
              style={[
                styles.initials,
                { fontSize: size * 0.4 },
              ]}
            >
              {getInitials(name)}
            </Text>
          )}
        </View>
      )}

      {isOnline && !isGroup && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: (size * 0.25) / 2,
              borderWidth: size * 0.04,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groupIcon: {
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#25D366',
    borderColor: '#fff',
  },
});

export default Avatar;
