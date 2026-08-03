// src/components/ImagePicker.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ImagePicker({ onImageSelect, label = 'Choose Image' }) {
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}>
        <label style={styles.label}>
          {label}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={styles.hiddenInput}
          />
        </label>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  hiddenInput: {
    display: 'none',
  },
});
