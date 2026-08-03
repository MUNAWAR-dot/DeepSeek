import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import useStore from '../store/store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/Common/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const { user, isAuthenticated, setUser, setIsInitialized } = useStore();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#075E54',
  },
});

export default RootNavigator;
