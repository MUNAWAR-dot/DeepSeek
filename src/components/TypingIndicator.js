// src/components/TypingIndicator.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TypingIndicator({ isTyping, userName }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {userName || 'Someone'} is typing{dots}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
