import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, radius } from './src/theme/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rentr</Text>
      <Text style={styles.subtitle}>Theme is working!</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>This is a themed card</Text>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.primaryLight,
    marginBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: radius.lg,
    width: '100%',
  },
  cardText: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
