import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  LogBox,
  Platform,
  UIManager,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/Common/SplashScreen';
import { initializeFirebase } from './src/services/firebase';
import { initializeSocket } from './src/services/socket';
import { requestAllPermissions } from './src/utils/permissions';
import { ErrorBoundary } from './src/components/Common/ErrorBoundary';
import { ThemeProvider } from './src/config/theme';
import useStore from './src/store/store';
import './src/i18n';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Non-serializable values were found in the navigation state',
]);

// Enable layout animation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const { isAuthenticated, theme } = useStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Firebase
      await initializeFirebase();
      
      // Initialize Socket.io connection
      await initializeSocket();
      
      // Request all necessary permissions
      await requestAllPermissions();
      
      // Simulate splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setInitError(error.message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Text style={styles.retryText}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider theme={theme}>
            <PaperProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor="#075E54"
                  translucent={false}
                />
                <RootNavigator />
              </NavigationContainer>
            </PaperProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#075E54',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 14,
    color: '#25D366',
  },
});

export default App;
