// ============================================
// EarningsScreen — Earnings dashboard with bar chart
// ============================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const MONTHLY_DATA = [
  { month: 'Oct', amount: 320 },
  { month: 'Nov', amount: 580 },
  { month: 'Dec', amount: 740 },
  { month: 'Jan', amount: 460 },
  { month: 'Feb', amount: 620 },
  { month: 'Mar', amount: 890 },
  { month: 'Apr', amount: 510 },
];

const PAYOUT_HISTORY = [
  { id: 'pay1', date: 'Apr 1, 2026', amount: '$420.00', status: 'paid', description: 'Monthly payout' },
  { id: 'pay2', date: 'Mar 1, 2026', amount: '$890.00', status: 'paid', description: 'Monthly payout' },
  { id: 'pay3', date: 'Feb 1, 2026', amount: '$310.00', status: 'pending', description: 'Processing payout' },
];

const CHART_MAX = Math.max(...MONTHLY_DATA.map((d) => d.amount));
const CHART_HEIGHT = 120;

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: colors.success, bg: '#D1FAE5' },
  pending: { label: 'Pending', color: colors.warning, bg: '#FEF3C7' },
};

function BarChart() {
  return (
    <View style={styles.chartWrapper}>
      <View style={styles.chartBars}>
        {MONTHLY_DATA.map((item, idx) => {
          const barHeight = Math.max((item.amount / CHART_MAX) * CHART_HEIGHT, 8);
          const isLast = idx === MONTHLY_DATA.length - 1;
          return (
            <View key={item.month} style={styles.barGroup}>
              <Text style={styles.barAmount}>${Math.round(item.amount / 10) * 10 >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight },
                    isLast && styles.barCurrent,
                  ]}
                />
              </View>
              <Text style={styles.barMonth}>{item.month}</Text>
            </View>
          );
        })}
      </View>
      {/* Horizontal guide lines */}
      <View style={styles.chartGuides} pointerEvents="none">
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <View
            key={frac}
            style={[
              styles.guideLine,
              { bottom: frac * CHART_HEIGHT + 28 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function EarningsScreen({ navigation }) {
  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('StripeConnect')} style={styles.payoutBtn}>
          <Text style={styles.payoutBtnText}>Payouts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardGradient} />
          <View style={styles.totalCardOverlay} />
          <View style={styles.totalCardContent}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalAmount}>$4,120</Text>
            <View style={styles.totalBadge}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={styles.totalBadgeText}>+18% from last month</Text>
            </View>
          </View>
          <Ionicons name="wallet" size={64} color="rgba(255,255,255,0.15)" style={styles.totalIcon} />
        </View>

        {/* This Month + Pending Row */}
        <View style={styles.statCardsRow}>
          <View style={styles.statCard}>
            <View style={styles.statCardIcon}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
            </View>
            <Text style={styles.statCardLabel}>This Month</Text>
            <Text style={styles.statCardValue}>$510</Text>
            <Text style={styles.statCardMeta}>Apr 2026</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statCardIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={18} color={colors.warning} />
            </View>
            <Text style={styles.statCardLabel}>Pending Payout</Text>
            <Text style={styles.statCardValue}>$310</Text>
            <Text style={styles.statCardMeta}>Processing</Text>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Monthly Overview</Text>
            <Text style={styles.chartPeriod}>Last 7 months</Text>
          </View>
          <BarChart />
        </View>

        {/* Payout History */}
        <View style={styles.card}>
          <View style={styles.payoutHeader}>
            <Text style={styles.sectionTitle}>Payout History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {PAYOUT_HISTORY.map((payout, idx) => {
            const cfg = STATUS_CONFIG[payout.status];
            return (
              <View
                key={payout.id}
                style={[
                  styles.payoutRow,
                  idx < PAYOUT_HISTORY.length - 1 && styles.payoutRowBorder,
                ]}
              >
                <View style={[styles.payoutIconWrapper, { backgroundColor: cfg.bg }]}>
                  <Ionicons
                    name={payout.status === 'paid' ? 'checkmark-circle' : 'time'}
                    size={20}
                    color={cfg.color}
                  />
                </View>
                <View style={styles.payoutInfo}>
                  <Text style={styles.payoutDesc}>{payout.description}</Text>
                  <Text style={styles.payoutDate}>{payout.date}</Text>
                </View>
                <View style={styles.payoutRight}>
                  <Text style={styles.payoutAmount}>{payout.amount}</Text>
                  <View style={[styles.payoutBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.payoutBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Connect Stripe CTA */}
        <TouchableOpacity
          style={styles.stripeCta}
          onPress={() => navigation.navigate('StripeConnect')}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={20} color={colors.primary} />
          <Text style={styles.stripeCtaText}>Manage Stripe Payout Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

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
  payoutBtn: {
    paddingHorizontal: spacing.sm,
  },
  payoutBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  totalCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    minHeight: 140,
    position: 'relative',
    justifyContent: 'flex-end',
    ...shadows.medium,
  },
  totalCardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  totalCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDark,
    opacity: 0.35,
  },
  totalCardContent: {
    gap: spacing.sm,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  totalAmount: {
    ...typography.h1,
    color: colors.textInverse,
    fontWeight: '700',
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  totalBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  totalIcon: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.small,
  },
  statCardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statCardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statCardValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statCardMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartPeriod: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chartWrapper: {
    position: 'relative',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 48,
    gap: spacing.sm,
    paddingBottom: 0,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    gap: 4,
  },
  barAmount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: `${colors.primary}60`,
    borderRadius: radius.sm,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  barCurrent: {
    backgroundColor: colors.primary,
  },
  barMonth: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  chartGuides: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  payoutRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  payoutIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  payoutInfo: {
    flex: 1,
    gap: 3,
  },
  payoutDesc: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  payoutDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  payoutRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  payoutAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  payoutBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  payoutBadgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  stripeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stripeCtaText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
});
