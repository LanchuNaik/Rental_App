// ============================================
// MyBookingsScreen — Renter bookings + Owner incoming requests
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import {
  getMyBookingsApi,
  getIncomingRequestsApi,
  acceptBookingApi,
  rejectBookingApi,
} from '../../services/booking.service';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

// ─── My Bookings helpers ───────────────────────────────────────────────────────
const BOOKING_TABS = ['Upcoming', 'Active', 'Past', 'Cancelled'];

const STATUS_TO_TAB = {
  pending:   'Upcoming',
  accepted:  'Upcoming',
  active:    'Active',
  completed: 'Past',
  cancelled: 'Cancelled',
  rejected:  'Cancelled',
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: colors.warning, bg: '#FEF3C7' },
  accepted:  { label: 'Accepted',  color: colors.success, bg: '#D1FAE5' },
  active:    { label: 'Active',    color: colors.success, bg: '#D1FAE5' },
  completed: { label: 'Completed', color: colors.primary, bg: colors.primaryLight },
  cancelled: { label: 'Cancelled', color: colors.error,   bg: '#FEE2E2' },
  rejected:  { label: 'Rejected',  color: colors.error,   bg: '#FEE2E2' },
};

function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-US', opts)} – ${new Date(end).toLocaleDateString('en-US', opts)}`;
}

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const AVATAR_COLORS = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#DDD6FE', '#FBCFE8', '#CFFAFE'];

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function BookingCard({ booking, onPress }) {
  const firstImage = booking.item?.images?.[0];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        {firstImage ? (
          <Image source={{ uri: `${BASE_URL}/${firstImage}` }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: '#BFDBFE' }]}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {booking.item?.title || 'Item'}
          </Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formatDateRange(booking.startDate, booking.endDate)}</Text>
          </View>
          <View style={styles.cardFooter}>
            <StatusBadge status={booking.status} />
            <Text style={styles.priceText}>${booking.totalPrice}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
        <Text style={styles.viewBtnText}>View Details</Text>
        <Ionicons name="chevron-forward" size={15} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function RequestCard({ request, index, onAccept, onDecline, onPress, actionLoading }) {
  const renterName = request.renter?.name || 'Renter';
  const days = daysBetween(request.startDate, request.endDate);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Renter row */}
      <View style={styles.requestHeader}>
        <View style={[styles.reqAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.reqAvatarText}>{getInitials(renterName)}</Text>
        </View>
        <View style={styles.reqHeaderInfo}>
          <Text style={styles.reqRenterName}>{renterName}</Text>
          <Text style={styles.reqSubmitted}>Submitted {timeAgo(request.createdAt)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      {/* Item info */}
      <View style={styles.reqItemSection}>
        <View style={styles.reqItemRow}>
          <Ionicons name="cube-outline" size={14} color={colors.primary} />
          <Text style={styles.reqItemTitle} numberOfLines={1}>{request.item?.title || 'Item'}</Text>
        </View>
        <View style={styles.reqItemRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.reqItemMeta}>{formatDateRange(request.startDate, request.endDate)}</Text>
          <Text style={styles.reqDaysBadge}>{days}d</Text>
        </View>
      </View>

      {/* Amount + actions */}
      <View style={styles.reqFooter}>
        <View>
          <Text style={styles.reqAmountLabel}>Total</Text>
          <Text style={styles.reqAmountValue}>${request.totalPrice}</Text>
        </View>
        <View style={styles.reqActions}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={onDecline}
            disabled={actionLoading === 'reject' || actionLoading === 'accept'}
          >
            {actionLoading === 'reject'
              ? <ActivityIndicator size="small" color={colors.error} />
              : <Text style={styles.declineBtnText}>Decline</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            disabled={actionLoading === 'accept' || actionLoading === 'reject'}
          >
            {actionLoading === 'accept'
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <>
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </>}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function MyBookingsScreen({ navigation }) {
  const [mode, setMode] = useState('bookings'); // 'bookings' | 'requests'

  // ── My Bookings state
  const [activeTab,   setActiveTab]   = useState('Upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [bLoading,    setBLoading]    = useState(true);
  const [bRefreshing, setBRefreshing] = useState(false);
  const [bError,      setBError]      = useState(null);

  // ── Incoming Requests state
  const [requests,      setRequests]      = useState([]);
  const [rLoading,      setRLoading]      = useState(true);
  const [rRefreshing,   setRRefreshing]   = useState(false);
  const [rError,        setRError]        = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) setBRefreshing(true); else setBLoading(true);
    setBError(null);
    try {
      const res = await getMyBookingsApi();
      setAllBookings(res.data?.bookings || res.data || []);
    } catch (err) {
      setBError(err.message || 'Failed to load bookings');
    } finally {
      setBLoading(false); setBRefreshing(false);
    }
  };

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRRefreshing(true); else setRLoading(true);
    setRError(null);
    try {
      const res = await getIncomingRequestsApi();
      setRequests(res.data?.bookings || res.data || []);
    } catch (err) {
      setRError(err.message || 'Failed to load requests');
    } finally {
      setRLoading(false); setRRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchBookings();
    fetchRequests();
  }, []));

  const handleAccept = (id) => {
    Alert.alert('Accept Booking', 'Accept this rental request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          setActionLoading((p) => ({ ...p, [id]: 'accept' }));
          try {
            await acceptBookingApi(id);
            setRequests((p) => p.filter((r) => r._id !== id));
            Alert.alert('Accepted', 'The renter has been notified.');
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not accept booking');
          } finally {
            setActionLoading((p) => ({ ...p, [id]: null }));
          }
        },
      },
    ]);
  };

  const handleDecline = (id) => {
    Alert.alert('Decline Request', 'Decline this booking request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline', style: 'destructive',
        onPress: async () => {
          setActionLoading((p) => ({ ...p, [id]: 'reject' }));
          try {
            await rejectBookingApi(id);
            setRequests((p) => p.filter((r) => r._id !== id));
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not decline booking');
          } finally {
            setActionLoading((p) => ({ ...p, [id]: null }));
          }
        },
      },
    ]);
  };

  const filteredBookings = allBookings.filter(
    (b) => (STATUS_TO_TAB[b.status] || 'Upcoming') === activeTab
  );

  return (
    <Screen>
      {/* ── Header with mode toggle ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        {requests.length > 0 && mode === 'bookings' && (
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: colors.warning }]}>{requests.length} new</Text>
          </View>
        )}
      </View>

      {/* ── Mode switcher pills ── */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'bookings' && styles.modeBtnActive]}
          onPress={() => setMode('bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color={mode === 'bookings' ? colors.textInverse : colors.textSecondary}
          />
          <Text style={[styles.modeBtnText, mode === 'bookings' && styles.modeBtnTextActive]}>
            My Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, mode === 'requests' && styles.modeBtnActive]}
          onPress={() => setMode('requests')}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={15}
            color={mode === 'requests' ? colors.textInverse : colors.textSecondary}
          />
          <Text style={[styles.modeBtnText, mode === 'requests' && styles.modeBtnTextActive]}>
            Incoming Requests
          </Text>
          {requests.length > 0 && (
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── My Bookings view ── */}
      {mode === 'bookings' && (
        <>
          <View style={styles.tabBar}>
            {BOOKING_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {bLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : bError ? (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>{bError}</Text>
              <TouchableOpacity onPress={() => fetchBookings()} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={bRefreshing} onRefresh={() => fetchBookings(true)} />
              }
            >
              {filteredBookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No bookings here</Text>
                  <Text style={styles.emptySubtitle}>
                    Your {activeTab.toLowerCase()} bookings will appear here.
                  </Text>
                </View>
              ) : (
                filteredBookings.map((b) => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    onPress={() => navigation.navigate('BookingDetail', { bookingId: b._id })}
                  />
                ))
              )}
            </ScrollView>
          )}
        </>
      )}

      {/* ── Incoming Requests view ── */}
      {mode === 'requests' && (
        <>
          {rLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : rError ? (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>{rError}</Text>
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
                <RefreshControl refreshing={rRefreshing} onRefresh={() => fetchRequests(true)} />
              }
            >
              {requests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={56} color={colors.success} />
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptySubtitle}>No pending booking requests.</Text>
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
        </>
      )}
    </Screen>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
  },
  modeBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeBtnTextActive: {
    color: colors.textInverse,
  },
  modeBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  modeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
    fontSize: 10,
  },

  // Booking tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.primary, fontWeight: '600' },

  list: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
  retryBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.primaryLight, borderRadius: radius.md },
  retryBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.primary },

  // Booking card
  card: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg, ...shadows.medium },
  cardRow: { flexDirection: 'row', gap: spacing.md },
  photo: { width: 80, height: 80, borderRadius: radius.md, flexShrink: 0 },
  photoPlaceholder: { width: 80, height: 80, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo: { flex: 1, gap: spacing.xs },
  cardTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dateText: { ...typography.caption, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, backgroundColor: '#FEF3C7' },
  badgeText: { ...typography.caption, fontWeight: '600' },
  priceText: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  viewBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.primary },

  // Request card
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reqAvatar: { width: 42, height: 42, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reqAvatarText: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  reqHeaderInfo: { flex: 1 },
  reqRenterName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  reqSubmitted: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  reqItemSection: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  reqItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reqItemTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  reqItemMeta: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  reqDaysBadge: { ...typography.caption, fontWeight: '600', color: colors.primary, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  reqFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  reqAmountLabel: { ...typography.caption, color: colors.textSecondary },
  reqAmountValue: { ...typography.h3, color: colors.textPrimary, marginTop: 2 },
  reqActions: { flexDirection: 'row', gap: spacing.sm },
  declineBtn: { borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', minWidth: 76 },
  declineBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.error },
  acceptBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minWidth: 76, justifyContent: 'center' },
  acceptBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.textInverse },

  emptyState: { alignItems: 'center', paddingTop: spacing.xxxl * 2, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptySubtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
});
