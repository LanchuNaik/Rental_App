// ============================================
// Splash Screen
// ============================================
// The first screen users see when opening the app.
// Shows the Rentr logo on a gradient background for ~2.5 seconds,
// then automatically moves to the Welcome screen.
// ============================================

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

export default function SplashScreen({ onFinish }) {
  // Track which loading dot is "active" — cycles 0 → 1 → 2 → 0 ...
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    // Cycle the loading dots every 400ms
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 400);

    // After 2.5 seconds, call onFinish (moves to next screen later)
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    // Cleanup — runs when screen unmounts, prevents memory leaks
    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* ------- Top spacer pushes content to middle ------- */}
        <View style={styles.spacer} />

        {/* ------- Main content (logo + name + tagline) ------- */}
        <View style={styles.content}>
          {/* Logo circle */}
          <View style={styles.logoCircle}>
            <Ionicons name="cube" size={56} color={colors.primary} />
          </View>

          {/* App name */}
          <Text style={styles.appName}>Rentr</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Rent anything, anywhere</Text>
        </View>

        {/* ------- Loading dots at the bottom ------- */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeDot === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxl,
  },
  spacer: {
    // Empty view — pushes content down to center
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.full, // circular
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.large,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: colors.background,
    width: 24, // active dot is wider (pill shape)
  },
});
