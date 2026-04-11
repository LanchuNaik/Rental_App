import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SplashScreen from './src/screens/auth/SplashScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
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

  // Placeholder for next screen (Login — coming next)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome finished!</Text>
      <Text style={styles.subtext}>Next: Login screen</Text>
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
