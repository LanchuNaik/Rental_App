import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SplashScreen from './src/screens/auth/SplashScreen';
import { colors, typography } from './src/theme/theme';

export default function App() {
  // Track if splash screen is still showing
  const [showSplash, setShowSplash] = useState(true);

  // While splash is active, show it
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // After splash finishes — placeholder for next screen
  // (We'll replace this with the Welcome screen in the next step)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Splash finished!</Text>
      <Text style={styles.subtext}>Next: Welcome screen</Text>
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
