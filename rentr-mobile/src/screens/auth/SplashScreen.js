// ============================================
// Splash Screen
// ============================================
// NAVIGATION NOTE (beginner):
// Every screen inside a Stack Navigator automatically receives
// a `navigation` prop from React Navigation.
// navigation.navigate('ScreenName') → go to that screen
// navigation.replace('ScreenName')  → go AND remove current from stack
//                                     (so back button won't return here)
// We use replace() on Splash so the user can't go "back" to it.
// ============================================

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

export default function SplashScreen({ navigation }) {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 400);

    const timer = setTimeout(() => {
      // replace() so back button won't come back to Splash
      navigation.replace('Welcome');
    }, 2500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.spacer} />
        <View style={styles.content}>
          <View style={styles.logoCircle}>
            <Ionicons name="cube" size={56} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Rentr</Text>
          <Text style={styles.tagline}>Rent anything, anywhere</Text>
        </View>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.dot, activeDot === index && styles.dotActive]}
            />
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:      { flex: 1 },
  safeArea:      { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xxxl },
  spacer:        {},
  content:       { alignItems: 'center' },
  logoCircle: {
    width: 120, height: 120, borderRadius: radius.full,
    backgroundColor: colors.background, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.xl, ...shadows.large,
  },
  appName: { fontSize: 48, fontWeight: '800', color: colors.textInverse, letterSpacing: -1, marginBottom: spacing.sm },
  tagline: { ...typography.body, color: colors.primaryLight, letterSpacing: 0.5 },
  dotsContainer: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  dot:       { width: 10, height: 10, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: colors.background, width: 24 },
});
