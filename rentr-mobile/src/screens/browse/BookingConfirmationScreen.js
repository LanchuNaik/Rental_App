// ============================================
// Booking Confirmation Screen
// ============================================

import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

export default function BookingConfirmationScreen({ navigation }) {
  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        </View>

        <Text style={styles.title}>Booking Requested!</Text>
        <Text style={styles.subtitle}>
          Your request has been sent to the owner. You'll get a notification once they accept.
        </Text>

        {/* Booking reference */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Booking Reference</Text>
          <Text style={styles.refValue}>#RNT-2026-7841</Text>
        </View>

        {/* What happens next */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          {[
            { icon: 'time',           text: 'Owner reviews your request (within 24h)' },
            { icon: 'card',           text: 'Payment is charged only after acceptance' },
            { icon: 'chatbubble',     text: 'Chat with the owner to arrange pickup' },
            { icon: 'camera',         text: 'Take condition photos at pickup' },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Bookings', { screen: 'MyBookings' })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Browse', { screen: 'BrowseFeed' })}
        >
          <Text style={styles.secondaryButtonText}>Back to Browse</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  iconCircle:     { width: 120, height: 120, borderRadius: radius.full, backgroundColor: colors.success + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title:          { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  subtitle:       { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  refCard:        { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, width: '100%' },
  refLabel:       { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  refValue:       { ...typography.h3, color: colors.primary },
  stepsCard:      { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, width: '100%', marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  stepsTitle:     { ...typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  step:           { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  stepIcon:       { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepText:       { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  primaryButton:  { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', width: '100%', ...shadows.medium, marginBottom: spacing.md },
  primaryButtonText: { ...typography.button, color: colors.textInverse },
  secondaryButton:{ height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', width: '100%' },
  secondaryButtonText: { ...typography.button, color: colors.primary },
});
