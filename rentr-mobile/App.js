// ============================================
// App.js — Root of the entire application
// ============================================
// HOW THIS WORKS (beginner explanation):
//
// NavigationContainer → the ROOT wrapper. Manages the navigation state
//   (which screen is active, history stack, etc.)
//   Every app using React Navigation MUST have exactly ONE NavigationContainer.
//
// AppNavigator → our custom navigator (AppNavigator.js) that decides:
//   - if NOT logged in → show AuthStack (Splash, Login, Register, etc.)
//   - if logged in → show MainTabs (Home, Browse, Bookings, Profile)
//
// isLoggedIn state → toggled when user successfully logs in.
// In a real app this comes from AsyncStorage (saved JWT token).
// ============================================

import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // This controls which navigator is shown: Auth or Main
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    // SafeAreaProvider must wrap everything — used by react-native-safe-area-context
    <SafeAreaProvider>
      {/*
        NavigationContainer:
        - Wraps the entire navigation tree
        - Must be at the very top, wrapping all navigators
        - onReady fires when navigation is ready (useful for analytics)
      */}
      <NavigationContainer>
        <AppNavigator
          isLoggedIn={isLoggedIn}
          // This callback is passed deep into auth screens (Login, RolePicker)
          // When called → flips isLoggedIn → NavigationContainer re-renders → shows MainTabs
          onLoginSuccess={() => setIsLoggedIn(true)}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
