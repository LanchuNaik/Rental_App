// ============================================
// SavedItemsScreen — Saved / wishlist items grid
// ============================================

import React, { useState } from 'react';
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

const INITIAL_SAVED = [
  {
    id: 's1',
    title: 'DJI Air 3 Drone',
    pricePerDay: 55,
    distance: '1.2 mi',
    placeholderColor: '#BFDBFE',
    rating: 4.9,
  },
  {
    id: 's2',
    title: 'Kayak — Single Person',
    pricePerDay: 30,
    distance: '3.5 mi',
    placeholderColor: '#BBF7D0',
    rating: 4.7,
  },
  {
    id: 's3',
    title: 'Electric Skateboard',
    pricePerDay: 22,
    distance: '0.8 mi',
    placeholderColor: '#FDE68A',
    rating: 4.8,
  },
  {
    id: 's4',
    title: 'Portable Projector',
    pricePerDay: 28,
    distance: '2.1 mi',
    placeholderColor: '#DDD6FE',
    rating: 4.6,
  },
  {
    id: 's5',
    title: 'Camping Hammock Set',
    pricePerDay: 12,
    distance: '4.0 mi',
    placeholderColor: '#FBCFE8',
    rating: 4.5,
  },
  {
    id: 's6',
    title: 'GoPro Hero 12 Kit',
    pricePerDay: 18,
    distance: '1.7 mi',
    placeholderColor: '#CFFAFE',
    rating: 4.9,
  },
];

function SavedCard({ item, onUnsave, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Photo */}
      <View style={[styles.cardPhoto, { backgroundColor: item.placeholderColor }]}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
        {/* Heart button */}
        <TouchableOpacity style={styles.heartBtn} onPress={onUnsave}>
          <Ionicons name="heart" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            <Text style={styles.priceAmount}>${item.pricePerDay}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={11} color={colors.textMuted} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SavedItemsScreen({ navigation }) {
  const [savedItems, setSavedItems] = useState(INITIAL_SAVED);

  const handleUnsave = (id) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <View style={styles.headerRight} />
      </View>

      {savedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={56} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any listing to save it here for later.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('BrowseFeed')}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={18} color={colors.textInverse} />
            <Text style={styles.browseBtnText}>Browse Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              {savedItems.length} saved item{savedItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {savedItems.map((item, idx) =>
              idx % 2 === 0 ? (
                <View key={item.id} style={styles.gridRow}>
                  <View style={styles.gridCell}>
                    <SavedCard
                      item={item}
                      onUnsave={() => handleUnsave(item.id)}
                      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                    />
                  </View>
                  {savedItems[idx + 1] ? (
                    <View style={styles.gridCell}>
                      <SavedCard
                        item={savedItems[idx + 1]}
                        onUnsave={() => handleUnsave(savedItems[idx + 1].id)}
                        onPress={() => navigation.navigate('ItemDetail', { itemId: savedItems[idx + 1].id })}
                      />
                    </View>
                  ) : (
                    <View style={styles.gridCell} />
                  )}
                </View>
              ) : null
            )}
            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </>
      )}
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
  countBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  },
  cardPhoto: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
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
    minHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {},
  priceAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  priceUnit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  browseBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
