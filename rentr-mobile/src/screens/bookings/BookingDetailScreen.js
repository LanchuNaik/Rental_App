// ============================================
// BookingDetailScreen — Full booking detail with timeline
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getBookingByIdApi, cancelBookingApi } from '../../services/booking.service';

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Requested', icon: 'paper-plane-outline' },
  { key: 'accepted',  label: 'Accepted',  icon: 'checkmark-circle-outline' },
  { key: 'pickup',    label: 'Pickup',    icon: 'location-outline' },
  { key: 'active',    label: 'Active',    icon: 'time-outline' },
  { key: 'returned',  label: 'Returned',  icon: 'return-down-back-outline' },
  { key: 'completed', label: 'Completed', icon: 'trophy-outline' },
];

const STEP_ORDER = ['requested', 'accepted', 'pickup', 'active', 'returned', 'completed'];

// Map booking status to timeline step
const STATUS_TO_STEP = {
  pending:   'requested',
  accepted:  'accepted',
  active:    'active',
  completed: 'completed',
  cancelled: 'requested',
  rejected:  'requested',
};

const STATUS_BADGE_CONFIG = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: colors.warning },
  accepted:  { label: 'Accepted',  bg: '#D1FAE5', color: colors.success },
  active:    { label: 'Active',    bg: '#D1FAE5', color: colors.success },
  completed: { label: 'Completed', bg: colors.primaryLight, color: colors.primary },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: colors.error },
  rejected:  { label: 'Rejected',  bg: '#FEE2E2', color: colors.error },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear().toString();
}

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function TimelineStep({ step, currentStatus, isLast }) {
  const mappedStep = STATUS_TO_STEP[currentStatus] || 'requested';
  const currentIndex = STEP_ORDER.indexOf(mappedStep);
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
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useFocusEffect(useCallback(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getBookingByIdApi(bookingId);
        setBooking(res.data?.booking || res.data);
      } catch (err) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingId]));

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelBookingApi(bookingId);
            const res = await getBookingByIdApi(bookingId);
            setBooking(res.data?.booking || res.data);
            Alert.alert('Cancelled', 'Your booking has been cancelled.');
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not cancel booking');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Detail</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !booking) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Detail</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
        </View>
      </Screen>
    );
  }

  const statusCfg = STATUS_BADGE_CONFIG[booking.status] || STATUS_BADGE_CONFIG.pending;
  const days = daysBetween(booking.startDate, booking.endDate);
  const pricePerDay = booking.item?.price || 0;
  const serviceFee = booking.serviceFee || 0;
  const deposit = booking.depositAmount || 0;
  const total = booking.totalPrice || 0;
  const ownerName = booking.owner?.name || 'Owner';
  const ownerRating = booking.owner?.rating || null;
  const bookingRef = `#RNT-${booking._id?.slice(-6).toUpperCase()}`;

  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const isOwner = false; // adjust based on auth context if needed

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Ref + Status */}
        <View style={styles.section}>
          <View style={styles.refRow}>
            <Text style={styles.refText}>{bookingRef}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
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
            <View style={[styles.itemPhoto, { backgroundColor: '#BFDBFE' }]}>
              <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{booking.item?.title || 'Item'}</Text>
              <Text style={styles.itemSubtitle}>{booking.item?.description?.slice(0, 60) || ''}</Text>
              {booking.item?.location?.address ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {booking.item.location.address}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rental Period</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxLabel}>From</Text>
              <Text style={styles.dateBoxValue}>{formatDate(booking.startDate)}</Text>
              <Text style={styles.dateBoxYear}>{formatYear(booking.startDate)}</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
              <Text style={styles.daysLabel}>{days} day{days !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateBoxLabel}>To</Text>
              <Text style={styles.dateBoxValue}>{formatDate(booking.endDate)}</Text>
              <Text style={styles.dateBoxYear}>{formatYear(booking.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>${pricePerDay}/day × {days} days</Text>
            <Text style={styles.priceValue}>${pricePerDay * days}</Text>
          </View>
          {serviceFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>${serviceFee}</Text>
            </View>
          )}
          {deposit > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Security deposit</Text>
              <Text style={styles.priceValue}>${deposit}</Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>${total}</Text>
          </View>
        </View>

        {/* Owner Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.personRow}>
            <View style={[styles.personAvatar, { backgroundColor: '#DDD6FE' }]}>
              <Text style={styles.personInitials}>{getInitials(ownerName)}</Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{ownerName}</Text>
              {ownerRating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{ownerRating} rating</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.navigate('Chat', { bookingId: booking._id })}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          {booking.status === 'accepted' && (
            <TouchableOpacity
              style={styles.pickupBtn}
              onPress={() => navigation.navigate('PickupPhotos', { bookingId: booking._id })}
              activeOpacity={0.85}
            >
              <Ionicons name="location" size={20} color={colors.textInverse} />
              <Text style={styles.pickupBtnText}>Go to Pickup</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'active' && (
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => navigation.navigate('ReturnConfirmation', { bookingId: booking._id })}
              activeOpacity={0.85}
            >
              <Ionicons name="return-down-back" size={20} color={colors.textInverse} />
              <Text style={styles.pickupBtnText}>Confirm Return</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'completed' && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('ReviewSubmit', { bookingId: booking._id })}
              activeOpacity={0.85}
            >
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <Text style={styles.reviewBtnText}>Write a Review</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* FAB Chat Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chat', { bookingId: booking._id })}
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
  headerRight: { width: 36 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl + spacing.xxxl,
  },
  section: { marginBottom: spacing.xs },
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
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
  timelineStep: { flex: 1, alignItems: 'center' },
  timelineLeft: { alignItems: 'center', width: '100%' },
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
  timelineCircleDone: { backgroundColor: colors.success, borderColor: colors.success },
  timelineCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: '50%',
    right: -50,
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  timelineLineDone: { backgroundColor: colors.success },
  timelineLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  timelineLabelActive: { color: colors.primary, fontWeight: '700' },
  timelineLabelDone: { color: colors.success, fontWeight: '600' },
  // Item
  itemRow: { flexDirection: 'row', gap: spacing.md },
  itemPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemInfo: { flex: 1, gap: spacing.xs },
  itemTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  itemSubtitle: { ...typography.bodySmall, color: colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
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
  dateBoxLabel: { ...typography.caption, color: colors.textSecondary },
  dateBoxValue: { ...typography.h3, color: colors.textPrimary },
  dateBoxYear: { ...typography.caption, color: colors.textMuted },
  dateArrow: { alignItems: 'center', gap: 4 },
  daysLabel: { ...typography.caption, color: colors.textSecondary },
  // Price
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { ...typography.body, color: colors.textSecondary },
  priceValue: { ...typography.body, color: colors.textPrimary },
  priceDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  priceTotalLabel: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  priceTotalValue: { ...typography.h3, color: colors.primary },
  // Person
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  personInfo: { flex: 1 },
  personName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...typography.caption, color: colors.textSecondary },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Actions
  actionSection: { gap: spacing.md, paddingTop: spacing.sm },
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
  returnBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  pickupBtnText: { ...typography.button, color: colors.textInverse },
  reviewBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  reviewBtnText: { ...typography.button, color: colors.primary },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.error },
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
