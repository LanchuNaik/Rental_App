// ============================================
// SavedItemsScreen — Saved / wishlist items grid
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getSavedItemsApi, unsaveItemApi } from '../../services/item.service';

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
        {item.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        ) : null}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            <Text style={styles.priceAmount}>₹{item.pricePerDay}</Text>
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
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await getSavedItemsApi();
        const items = res.data.map((item) => ({
          id: item._id,
          title: item.title,
          pricePerDay: item.pricePerDay,
          distance: item.location?.address || '',
          placeholderColor: '#BFDBFE',
          rating: item.avgRating || null,
        }));
        setSavedItems(items);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load saved items');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleUnsave = async (id) => {
    try {
      await unsaveItemApi(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to remove item');
    }
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} size="large" color={colors.primary} />
      ) : savedItems.length === 0 ? (
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
