import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SplashScreen from './src/screens/auth/SplashScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import { colors, typography } from './src/theme/theme';

// Simple "screen" state — we'll replace this with React Navigation later
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={() => setCurrentScreen('welcome')} />;
  }

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onFinish={() => setCurrentScreen('login')} />;
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={(user) => {
          console.log('Logged in:', user);
          setCurrentScreen('home');
        }}
        onGoToRegister={() => setCurrentScreen('register')}
        onForgotPassword={() => setCurrentScreen('forgot')}
      />
    );
  }

  // Placeholder for next screens
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Next: {currentScreen}</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
