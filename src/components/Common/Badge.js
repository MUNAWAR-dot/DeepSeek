import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ count, maxCount = 99, size = 'medium', color = '#FF3B30', style }) => {
  if (!count || count <= 0) return null;

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 18, height: 18, fontSize: 10 };
      case 'large':
        return { width: 28, height: 28, fontSize: 14 };
      default:
        return { width: 22, height: 22, fontSize: 12 };
    }
  };

  const dimensions = getSize();
  const displayText = count > maxCount ? `${maxCount}+` : `${count}`;

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.width / 2,
          backgroundColor: color,
        },
        count > maxCount && { paddingHorizontal: 2, width: 'auto', minWidth: dimensions.width },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: dimensions.fontSize }]} numberOfLines={1}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Badge;
