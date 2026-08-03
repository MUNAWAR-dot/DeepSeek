import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../config/theme';

const Divider = ({ text, color, style }) => {
  const { theme } = useTheme();

  if (text) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.line, { backgroundColor: color || theme.colors.border }]} />
        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>{text}</Text>
        <View style={[styles.line, { backgroundColor: color || theme.colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.line,
        styles.simple,
        { backgroundColor: color || theme.colors.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
  },
  simple: {
    marginVertical: 10,
  },
  text: {
    marginHorizontal: 15,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Divider;
