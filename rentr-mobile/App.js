import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getToken } from './src/services/storage.service';
import { colors } from './src/theme/theme';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking,   setChecking]   = useState(true); // true while reading AsyncStorage

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await getToken();
        if (token) setIsLoggedIn(true);
      } catch {
        // no token — stay logged out
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  // Show a blank loading screen while we check AsyncStorage
  // This prevents the splash/onboarding from flashing for logged-in users
  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator
          isLoggedIn={isLoggedIn}
          onLoginSuccess={() => setIsLoggedIn(true)}
          onLogout={() => setIsLoggedIn(false)}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
