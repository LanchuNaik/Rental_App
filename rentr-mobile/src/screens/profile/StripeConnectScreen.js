// ============================================
// StripeConnectScreen — Stripe Connect onboarding
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const KYC_STEPS = [
  {
    icon: 'person-circle-outline',
    title: 'Identity Verification',
    description: "Government-issued ID (passport, driver's license) to verify your identity.",
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: 'business-outline',
    title: 'Bank Account',
    description: 'Connect your bank account where earnings will be deposited.',
    color: colors.success,
    bg: '#D1FAE5',
  },
  {
    icon: 'document-text-outline',
    title: 'Tax Information',
    description: 'SSN or EIN for tax reporting (W-9 for US users).',
    color: colors.warning,
    bg: '#FEF3C7',
  },
];

function ConnectedState({ onDisconnect }) {
  return (
    <View style={styles.connectedContainer}>
      {/* Header */}
      <View style={styles.connectedHeader}>
        <View style={styles.connectedIconWrapper}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>
        <Text style={styles.connectedTitle}>Stripe Connected</Text>
        <Text style={styles.connectedSubtitle}>
          Your account is verified and ready to receive payouts.
        </Text>
      </View>

      {/* Payout Info */}
      <View style={styles.payoutInfoCard}>
        <View style={styles.payoutInfoRow}>
          <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
          <View style={styles.payoutInfoText}>
            <Text style={styles.payoutInfoLabel}>Bank Account</Text>
            <Text style={styles.payoutInfoValue}>Chase •••• 4821</Text>
          </View>
          <View style={styles.payoutInfoBadge}>
            <Text style={styles.payoutInfoBadgeText}>Active</Text>
          </View>
        </View>
        <View style={styles.payoutDivider} />
        <View style={styles.payoutInfoRow}>
          <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
          <View style={styles.payoutInfoText}>
            <Text style={styles.payoutInfoLabel}>Payout Schedule</Text>
            <Text style={styles.payoutInfoValue}>Monthly (1st of each month)</Text>
          </View>
        </View>
        <View style={styles.payoutDivider} />
        <View style={styles.payoutInfoRow}>
          <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
          <View style={styles.payoutInfoText}>
            <Text style={styles.payoutInfoLabel}>Pending Balance</Text>
            <Text style={[styles.payoutInfoValue, { color: colors.success, fontWeight: '700' }]}>$310.00</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.stripePortalBtn} activeOpacity={0.85}>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
        <Text style={styles.stripePortalBtnText}>Open Stripe Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.disconnectBtn} onPress={onDisconnect} activeOpacity={0.8}>
        <Text style={styles.disconnectBtnText}>Disconnect Stripe Account</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function StripeConnectScreen({ navigation }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      Alert.alert(
        'Stripe Connect',
        'This would open the Stripe Connect OAuth flow in a browser.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Simulate Success', onPress: () => setIsConnected(true) },
        ]
      );
    }, 500);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Stripe',
      'Are you sure? You will no longer receive payouts until you reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => setIsConnected(false),
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Setup</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {isConnected ? (
          <ConnectedState onDisconnect={handleDisconnect} />
        ) : (
          <>
            {/* Illustration Area */}
            <View style={styles.illustrationArea}>
              <View style={styles.illustrationIcon}>
                <Ionicons name="card" size={56} color={colors.primary} />
              </View>
              <Text style={styles.illustrationTitle}>Get Paid for Your Rentals</Text>
              <Text style={styles.illustrationSubtitle}>
                Rentr uses Stripe Connect to securely process payments and deposit earnings directly to your bank account.
              </Text>
            </View>

            {/* KYC Steps */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>What Stripe Requires</Text>
              {KYC_STEPS.map((step, idx) => (
                <View
                  key={idx}
                  style={[styles.kycStep, idx < KYC_STEPS.length - 1 && styles.kycStepBorder]}
                >
                  <View style={[styles.kycIcon, { backgroundColor: step.bg }]}>
                    <Ionicons name={step.icon} size={22} color={step.color} />
                  </View>
                  <View style={styles.kycInfo}>
                    <Text style={styles.kycTitle}>{step.title}</Text>
                    <Text style={styles.kycDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* How It Works */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>How Payouts Work</Text>
              {[
                { icon: 'checkmark-circle-outline', text: 'Renter books and pays upfront' },
                { icon: 'lock-closed-outline', text: 'Payment is held securely during rental' },
                { icon: 'return-down-forward-outline', text: 'Funds released on successful return' },
                { icon: 'wallet-outline', text: 'Deposited to your bank on next payout date' },
              ].map((item, idx) => (
                <View key={idx} style={styles.howRow}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                  <Text style={styles.howText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* Connect Button */}
            <TouchableOpacity
              style={[styles.connectBtn, connecting && styles.connectBtnLoading]}
              onPress={handleConnect}
              activeOpacity={0.85}
              disabled={connecting}
            >
              <Ionicons name="card" size={22} color={colors.textInverse} />
              <Text style={styles.connectBtnText}>
                {connecting ? 'Connecting...' : 'Connect with Stripe'}
              </Text>
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
              <Text style={styles.securityNoteText}>
                Your financial information is encrypted and processed securely by Stripe. Rentr never stores your banking details.
              </Text>
            </View>

            {/* Stripe Logo Area */}
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>Payments powered by</Text>
              <View style={styles.stripeBadge}>
                <Ionicons name="card" size={14} color={colors.textSecondary} />
                <Text style={styles.stripeBadgeText}>Stripe</Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  illustrationArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  illustrationIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  illustrationTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  illustrationSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  kycStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  kycStepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kycIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kycInfo: {
    flex: 1,
    gap: 4,
  },
  kycTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  kycDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  howText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    ...shadows.medium,
  },
  connectBtnLoading: {
    backgroundColor: colors.primaryDark,
  },
  connectBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  securityNoteText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  poweredByText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stripeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  // Connected state
  connectedContainer: {
    gap: spacing.lg,
  },
  connectedHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  connectedIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  connectedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  connectedSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  payoutInfoCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  payoutInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  payoutInfoText: {
    flex: 1,
    gap: 3,
  },
  payoutInfoLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  payoutInfoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  payoutInfoBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  payoutInfoBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
  },
  payoutDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  stripePortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  stripePortalBtnText: {
    ...typography.button,
    color: colors.primary,
  },
  disconnectBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  disconnectBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.error,
  },
});
