// ============================================
// Role Picker Screen
// ============================================
// After registration, user chooses their role:
// "I want to Rent", "I want to List", or "Both".
// Each option is a large tappable card.
// ============================================

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const roles = [
  {
    id: 'renter',
    icon: 'search',
    title: 'I want to Rent',
    description: 'Browse and book items from people near you. Tools, gear, vehicles and more.',
    color: colors.primary,
    lightColor: colors.primaryLight,
  },
  {
    id: 'owner',
    icon: 'pricetag',
    title: 'I want to List',
    description: 'Earn money renting out things you own. Set your price, approve bookings.',
    color: colors.accent,
    lightColor: colors.accent + '15',
  },
  {
    id: 'both',
    icon: 'swap-horizontal',
    title: 'Both',
    description: "Rent from others and list your own stuff. Get the full Rentr experience.",
    color: colors.success,
    lightColor: colors.success + '15',
  },
];

export default function RolePickerScreen({ onRoleSelected }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      // TODO: call PUT /api/users/me/role with selectedRole
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (onRoleSelected) onRoleSelected(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How will you use Rentr?</Text>
          <Text style={styles.subtitle}>
            Choose your role — you can always change this later in settings.
          </Text>
        </View>

        {/* Role cards */}
        <View style={styles.cardsContainer}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isSelected && { borderColor: role.color },
                ]}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
              >
                {/* Selected checkmark badge */}
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: role.color }]}>
                    <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                  </View>
                )}

                {/* Icon */}
                <View style={[styles.iconCircle, { backgroundColor: role.lightColor }]}>
                  <Ionicons name={role.icon} size={36} color={role.color} />
                </View>

                {/* Text */}
                <Text style={[styles.cardTitle, isSelected && { color: role.color }]}>
                  {role.title}
                </Text>
                <Text style={styles.cardDescription}>{role.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !selectedRole && styles.buttonDisabled,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textInverse} style={{ marginLeft: spacing.sm }} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>You can change your role anytime in Settings</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    position: 'relative',
    ...shadows.small,
  },
  cardSelected: {
    backgroundColor: colors.background,
    ...shadows.medium,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
