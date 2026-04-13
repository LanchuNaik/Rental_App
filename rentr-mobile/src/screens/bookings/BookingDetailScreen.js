// ============================================
// BookingDetailScreen — Full booking detail with timeline
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

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Requested', icon: 'paper-plane-outline' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
  { key: 'pickup', label: 'Pickup', icon: 'location-outline' },
  { key: 'active', label: 'Active', icon: 'time-outline' },
  { key: 'returned', label: 'Returned', icon: 'return-down-back-outline' },
  { key: 'completed', label: 'Completed', icon: 'trophy-outline' },
];

const STEP_ORDER = ['requested', 'accepted', 'pickup', 'active', 'returned', 'completed'];

const MOCK_BOOKING = {
  id: 'b_detail_1',
  status: 'accepted',
  itemTitle: 'Sony A7 III Camera',
  itemSubtitle: 'Full-frame mirrorless, 24MP',
  placeholderColor: '#BFDBFE',
  dates: 'Apr 15 – Apr 18, 2026',
  pickupLocation: '123 Main St, San Francisco, CA',
  days: 3,
  pricePerDay: 40,
  serviceFee: 12,
  depositAmount: 50,
  total: 182,
  ownerName: 'Alex Rivera',
  ownerInitials: 'AR',
  ownerRating: 4.9,
  ownerAvatarColor: '#DDD6FE',
  renterName: 'Jamie Doe',
  renterInitials: 'JD',
  renterAvatarColor: '#BBF7D0',
  bookingRef: '#RNT-2026-00142',
};

function TimelineStep({ step, currentStatus, isLast }) {
  const currentIndex = STEP_ORDER.indexOf(currentStatus);
  const stepIndex = STEP_ORDER.indexOf(step.key);
  const isDone = stepIndex < currentIndex;
  const isActive = stepIndex === currentIndex;

  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineCircle,
            isDone && styles.timelineCircleDone,
            isActive && styles.timelineCircleActive,
          ]}
        >
          {isDone ? (
            <Ionicons name="checkmark" size={12} color={colors.textInverse} />
          ) : (
            <Ionicons
              name={step.icon}
              size={12}
              color={isActive ? colors.textInverse : colors.textMuted}
            />
          )}
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
        )}
      </View>
      <Text
        style={[
          styles.timelineLabel,
          isActive && styles.timelineLabelActive,
          isDone && styles.timelineLabelDone,
        ]}
      >
        {step.label}
      </Text>
    </View>
  );
}

export default function BookingDetailScreen({ navigation, route }) {
  const booking = MOCK_BOOKING;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Booking Ref + Status */}
        <View style={styles.section}>
          <View style={styles.refRow}>
            <Text style={styles.refText}>{booking.bookingRef}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Accepted</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, idx) => (
              <TimelineStep
                key={step.key}
                step={step}
                currentStatus={booking.status}
                isLast={idx === TIMELINE_STEPS.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Item Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item</Text>
          <View style={styles.itemRow}>
            <View style={[styles.itemPhoto, { backgroundColor: booking.placeholderColor }]}>
              <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{booking.itemTitle}</Text>
              <Text style={styles.itemSubtitle}>{booking.itemSubtitle}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>{booking.pickupLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rental Period</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxLabel}>From</Text>
              <Text style={styles.dateBoxValue}>Apr 15</Text>
              <Text style={styles.dateBoxYear}>2026</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
              <Text style={styles.daysLabel}>{booking.days} days</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxLabel}>To</Text>
              <Text style={styles.dateBoxValue}>Apr 18</Text>
              <Text style={styles.dateBoxYear}>2026</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>${booking.pricePerDay}/day × {booking.days} days</Text>
            <Text style={styles.priceValue}>${booking.pricePerDay * booking.days}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>${booking.serviceFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Security deposit</Text>
            <Text style={styles.priceValue}>${booking.depositAmount}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>${booking.total}</Text>
          </View>
        </View>

        {/* Owner Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.personRow}>
            <View style={[styles.personAvatar, { backgroundColor: booking.ownerAvatarColor }]}>
              <Text style={styles.personInitials}>{booking.ownerInitials}</Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{booking.ownerName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{booking.ownerRating} rating</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.messageBtn}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.pickupBtn}
            onPress={() => navigation.navigate('PickupPhotos')}
            activeOpacity={0.85}
          >
            <Ionicons name="location" size={20} color={colors.textInverse} />
            <Text style={styles.pickupBtnText}>Go to Pickup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FAB Chat Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chat')}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble" size={24} color={colors.textInverse} />
      </TouchableOpacity>
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
    gap: spacing.md,
    paddingBottom: spacing.xxxl + spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xs,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.success,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Timeline
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineLeft: {
    alignItems: 'center',
    width: '100%',
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: '50%',
    right: -50,
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  timelineLineDone: {
    backgroundColor: colors.success,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  timelineLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  timelineLabelDone: {
    color: colors.success,
    fontWeight: '600',
  },
  // Item
  itemRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  // Dates
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    minWidth: 80,
  },
  dateBoxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateBoxValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  dateBoxYear: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dateArrow: {
    alignItems: 'center',
    gap: 4,
  },
  daysLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  priceValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  priceTotalLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  // Person
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    paddingTop: spacing.sm,
  },
  pickupBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  pickupBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
});
