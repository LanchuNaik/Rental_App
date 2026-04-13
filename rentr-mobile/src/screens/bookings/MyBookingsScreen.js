// ============================================
// MyBookingsScreen — Renter's booking history with tabs
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const TABS = ['Upcoming', 'Active', 'Past', 'Cancelled'];

const MOCK_BOOKINGS = {
  Upcoming: [
    {
      id: 'b1',
      itemTitle: 'Sony A7 III Camera',
      dateRange: 'Apr 15 – Apr 18, 2026',
      status: 'pending',
      price: '$120',
      placeholderColor: '#BFDBFE',
    },
    {
      id: 'b2',
      itemTitle: 'DJI Mini 3 Drone',
      dateRange: 'Apr 22 – Apr 24, 2026',
      status: 'accepted',
      price: '$90',
      placeholderColor: '#BBF7D0',
    },
  ],
  Active: [
    {
      id: 'b3',
      itemTitle: 'Trek Mountain Bike',
      dateRange: 'Apr 10 – Apr 14, 2026',
      status: 'active',
      price: '$60',
      placeholderColor: '#FDE68A',
    },
    {
      id: 'b4',
      itemTitle: 'Kayak — 2 Person',
      dateRange: 'Apr 11 – Apr 13, 2026',
      status: 'active',
      price: '$75',
      placeholderColor: '#FBCFE8',
    },
  ],
  Past: [
    {
      id: 'b5',
      itemTitle: 'Camping Tent (4-person)',
      dateRange: 'Mar 20 – Mar 23, 2026',
      status: 'completed',
      price: '$45',
      placeholderColor: '#DDD6FE',
    },
    {
      id: 'b6',
      itemTitle: 'Surfboard — Longboard 9ft',
      dateRange: 'Mar 5 – Mar 7, 2026',
      status: 'completed',
      price: '$55',
      placeholderColor: '#CFFAFE',
    },
    {
      id: 'b7',
      itemTitle: 'Electric Scooter',
      dateRange: 'Feb 14 – Feb 16, 2026',
      status: 'completed',
      price: '$40',
      placeholderColor: '#FEF9C3',
    },
  ],
  Cancelled: [
    {
      id: 'b8',
      itemTitle: 'Road Bike — Carbon Frame',
      dateRange: 'Jan 30 – Feb 2, 2026',
      status: 'cancelled',
      price: '$80',
      placeholderColor: '#FEE2E2',
    },
    {
      id: 'b9',
      itemTitle: 'Stand-up Paddleboard',
      dateRange: 'Jan 10 – Jan 12, 2026',
      status: 'cancelled',
      price: '$50',
      placeholderColor: '#E5E7EB',
    },
  ],
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: colors.warning, bg: '#FEF3C7' },
  accepted: { label: 'Accepted', color: colors.success, bg: '#D1FAE5' },
  active: { label: 'Active', color: colors.success, bg: '#D1FAE5' },
  completed: { label: 'Completed', color: colors.primary, bg: colors.primaryLight },
  cancelled: { label: 'Cancelled', color: colors.error, bg: '#FEE2E2' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function BookingCard({ booking, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        <View style={[styles.photoPlaceholder, { backgroundColor: booking.placeholderColor }]}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{booking.itemTitle}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.dateText}>{booking.dateRange}</Text>
          </View>
          <View style={styles.cardFooter}>
            <StatusBadge status={booking.status} />
            <Text style={styles.priceText}>{booking.price}</Text>
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

export default function MyBookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const bookings = MOCK_BOOKINGS[activeTab] || [];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
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

      {/* Booking List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No bookings here</Text>
            <Text style={styles.emptySubtitle}>Your {activeTab.toLowerCase()} bookings will appear here.</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
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
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  priceText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  viewBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
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
    paddingHorizontal: spacing.xl,
  },
});
