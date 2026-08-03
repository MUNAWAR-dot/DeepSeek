import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import PhoneAuthScreen from '../screens/Auth/PhoneAuthScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Welcome' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name="PhoneAuth" 
        component={PhoneAuthScreen}
        options={{ title: 'Phone Verification' }}
      />
      <Stack.Screen 
        name="OTP" 
        component={OTPScreen}
        options={{ title: 'Enter Code' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
