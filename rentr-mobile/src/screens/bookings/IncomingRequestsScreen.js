// ============================================
// IncomingRequestsScreen — Owner's pending booking requests
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import {
  getIncomingRequestsApi,
  acceptBookingApi,
  rejectBookingApi,
} from '../../services/booking.service';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  const e = new Date(end).toLocaleDateString('en-US', opts);
  return `${s} – ${e}`;
}

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

const AVATAR_COLORS = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#DDD6FE', '#FBCFE8', '#CFFAFE'];

function RenterAvatar({ name, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function RequestCard({ request, index, onAccept, onDecline, onPress, actionLoading }) {
  const renterName = request.renter?.name || 'Renter';
  const days = daysBetween(request.startDate, request.endDate);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardHeader}>
        <RenterAvatar name={renterName} index={index} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.renterName}>{renterName}</Text>
          <Text style={styles.submittedText}>
            Submitted {timeAgo(request.createdAt)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.itemSection}>
        <View style={styles.itemRow}>
          <Ionicons name="cube-outline" size={15} color={colors.primary} />
          <Text style={styles.itemTitle}>{request.item?.title || 'Item'}</Text>
        </View>
        <View style={styles.itemRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.itemMeta}>
            {formatDateRange(request.startDate, request.endDate)}
          </Text>
          <Text style={styles.daysBadge}>{days} day{days !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${request.totalPrice}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={onDecline}
            activeOpacity={0.8}
            disabled={actionLoading === 'accept' || actionLoading === 'reject'}
          >
            {actionLoading === 'reject' ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={styles.declineBtnText}>Decline</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.8}
            disabled={actionLoading === 'accept' || actionLoading === 'reject'}
          >
            {actionLoading === 'accept' ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons name="checkmark" size={15} color={colors.textInverse} />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function IncomingRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // bookingId -> 'accept' | 'reject'

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getIncomingRequestsApi();
      setRequests(res.data?.bookings || res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchRequests(); }, []));

  const handleAccept = (id) => {
    Alert.alert('Accept Booking', 'Accept this rental request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          setActionLoading((prev) => ({ ...prev, [id]: 'accept' }));
          try {
            await acceptBookingApi(id);
            setRequests((prev) => prev.filter((r) => r._id !== id));
            Alert.alert('Accepted', 'The renter has been notified.');
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not accept booking');
          } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
          }
        },
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
          onPress: async () => {
            setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
            try {
              await rejectBookingApi(id);
              setRequests((prev) => prev.filter((r) => r._id !== id));
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not decline booking');
            } finally {
              setActionLoading((prev) => ({ ...prev, [id]: null }));
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchRequests()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchRequests(true)} />
          }
        >
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>You have no pending booking requests.</Text>
            </View>
          ) : (
            requests.map((req, idx) => (
              <RequestCard
                key={req._id}
                request={req}
                index={idx}
                actionLoading={actionLoading[req._id]}
                onAccept={() => handleAccept(req._id)}
                onDecline={() => handleDecline(req._id)}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: req._id })}
              />
            ))
          )}
        </ScrollView>
      )}
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
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  retryBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
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
    minWidth: 80,
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
    minWidth: 80,
    justifyContent: 'center',
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
