import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({
  children,
  colors = ['#075E54', '#128C7E', '#25D366'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  ...props
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
