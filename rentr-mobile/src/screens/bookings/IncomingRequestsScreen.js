// ============================================
// IncomingRequestsScreen — Owner's pending booking requests
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

const INITIAL_REQUESTS = [
  {
    id: 'r1',
    renterName: 'Marcus Chen',
    initials: 'MC',
    avatarColor: '#BFDBFE',
    itemTitle: 'Sony A7 III Camera',
    dates: 'Apr 15 – Apr 18, 2026',
    days: 3,
    totalAmount: '$120.00',
    submittedAgo: '2 hours ago',
  },
  {
    id: 'r2',
    renterName: 'Priya Sharma',
    initials: 'PS',
    avatarColor: '#BBF7D0',
    itemTitle: 'DJI Mini 3 Drone',
    dates: 'Apr 22 – Apr 24, 2026',
    days: 2,
    totalAmount: '$90.00',
    submittedAgo: '5 hours ago',
  },
  {
    id: 'r3',
    renterName: 'Tyler Brooks',
    initials: 'TB',
    avatarColor: '#FDE68A',
    itemTitle: 'Trek Mountain Bike',
    dates: 'Apr 28 – May 1, 2026',
    days: 3,
    totalAmount: '$60.00',
    submittedAgo: '1 day ago',
  },
];

function RenterAvatar({ initials, color }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function RequestCard({ request, onAccept, onDecline, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <RenterAvatar initials={request.initials} color={request.avatarColor} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.renterName}>{request.renterName}</Text>
          <Text style={styles.submittedText}>Submitted {request.submittedAgo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      {/* Item Info */}
      <View style={styles.itemSection}>
        <View style={styles.itemRow}>
          <Ionicons name="cube-outline" size={15} color={colors.primary} />
          <Text style={styles.itemTitle}>{request.itemTitle}</Text>
        </View>
        <View style={styles.itemRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.itemMeta}>{request.dates}</Text>
          <Text style={styles.daysBadge}>{request.days} days</Text>
        </View>
      </View>

      {/* Amount + Actions */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>{request.totalAmount}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={onDecline}
            activeOpacity={0.8}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={15} color={colors.textInverse} />
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function IncomingRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleAccept = (id) => {
    Alert.alert('Booking Accepted', 'The renter has been notified.', [
      {
        text: 'OK',
        onPress: () => setRequests((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  };

  const handleDecline = (id) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => setRequests((prev) => prev.filter((r) => r.id !== id)),
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Incoming Requests</Text>
          <Text style={styles.headerSubtitle}>Review and respond to rental requests</Text>
        </View>
        {requests.length > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{requests.length} pending</Text>
          </View>
        )}
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>You have no pending booking requests.</Text>
          </View>
        ) : (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={() => handleAccept(req.id)}
              onDecline={() => handleDecline(req.id)}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: req.id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  list: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.medium,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  renterName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  submittedText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  itemMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  daysBadge: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.error,
  },
  acceptBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  acceptBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
