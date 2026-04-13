// ============================================
// MyListingsScreen — Owner's listings grid
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const INITIAL_LISTINGS = [
  {
    id: 'l1',
    title: 'Sony A7 III Camera',
    pricePerDay: 40,
    isActive: true,
    views: 142,
    bookings: 8,
    placeholderColor: '#BFDBFE',
  },
  {
    id: 'l2',
    title: 'DJI Mini 3 Drone',
    pricePerDay: 45,
    isActive: true,
    views: 89,
    bookings: 5,
    placeholderColor: '#BBF7D0',
  },
  {
    id: 'l3',
    title: 'Trek Mountain Bike',
    pricePerDay: 20,
    isActive: false,
    views: 210,
    bookings: 12,
    placeholderColor: '#FDE68A',
  },
  {
    id: 'l4',
    title: 'Camping Tent (4-Person)',
    pricePerDay: 15,
    isActive: true,
    views: 67,
    bookings: 4,
    placeholderColor: '#DDD6FE',
  },
  {
    id: 'l5',
    title: 'Surfboard — 9ft Longboard',
    pricePerDay: 18,
    isActive: true,
    views: 55,
    bookings: 3,
    placeholderColor: '#FBCFE8',
  },
];

function ListingCard({ listing, onToggle }) {
  return (
    <View style={styles.card}>
      {/* Photo Placeholder */}
      <View style={[styles.cardPhoto, { backgroundColor: listing.placeholderColor }]}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
        {/* Status pill on photo */}
        <View style={[styles.statusPill, listing.isActive ? styles.statusPillActive : styles.statusPillPaused]}>
          <Text style={styles.statusPillText}>{listing.isActive ? 'Active' : 'Paused'}</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.priceText}>${listing.pricePerDay}<Text style={styles.priceUnit}>/day</Text></Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
            <Text style={styles.statText}>{listing.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            <Text style={styles.statText}>{listing.bookings}</Text>
          </View>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, listing.isActive ? styles.toggleLabelActive : styles.toggleLabelPaused]}>
            {listing.isActive ? 'Active' : 'Paused'}
          </Text>
          <Switch
            value={listing.isActive}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={listing.isActive ? colors.primary : colors.textMuted}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      {/* More Options Button */}
      <TouchableOpacity style={styles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function MyListingsScreen({ navigation }) {
  const [listings, setListings] = useState(INITIAL_LISTINGS);

  const toggleListing = (id) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  const activeCount = listings.filter((l) => l.isActive).length;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} •{' '}
          <Text style={styles.summaryActive}>{activeCount} active</Text>
        </Text>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>Start earning by listing your items for rent.</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddListing')}
            activeOpacity={0.85}
          >
            <Text style={styles.addFirstBtnText}>Add First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          {listings.map((listing, idx) => (
            idx % 2 === 0 ? (
              <View key={listing.id} style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <ListingCard
                    listing={listing}
                    onToggle={() => toggleListing(listing.id)}
                  />
                </View>
                {listings[idx + 1] ? (
                  <View style={styles.gridCell}>
                    <ListingCard
                      listing={listings[idx + 1]}
                      onToggle={() => toggleListing(listings[idx + 1].id)}
                    />
                  </View>
                ) : (
                  <View style={styles.gridCell} />
                )}
              </View>
            ) : null
          ))}
          <View style={{ height: spacing.xxxl + spacing.xxxl }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddListing')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
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
  summaryBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  summaryActive: {
    color: colors.success,
    fontWeight: '600',
  },
  grid: {
    padding: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.small,
    position: 'relative',
  },
  cardPhoto: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusPill: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusPillActive: {
    backgroundColor: colors.success,
  },
  statusPillPaused: {
    backgroundColor: colors.textMuted,
  },
  statusPillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 16,
  },
  priceText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  priceUnit: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: colors.success,
  },
  toggleLabelPaused: {
    color: colors.textMuted,
  },
  moreBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
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
  addFirstBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  addFirstBtnText: {
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
});
