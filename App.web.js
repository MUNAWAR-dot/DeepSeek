// App.web.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 ChatsApp</Text>
      <Text style={styles.sub}>Web version is working!</Text>
      <Text style={styles.sub}>Netlify deploy successful ✅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  sub: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
