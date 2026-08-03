// App.js
import React from 'react';
import { Platform } from 'react-native';

// Use different App based on platform
let AppComponent = null;

if (Platform.OS === 'web') {
  // Web version - full app with navigation
  AppComponent = require('./App.web').default;
} else {
  // Native version - full app
  AppComponent = require('./App.native').default;
}

export default AppComponent;
