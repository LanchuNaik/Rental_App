// ============================================
// MyListingsScreen — Owner's listings grid
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, ActivityIndicator, Alert, Image, ActionSheetIOS, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getMyItemsApi, deleteItemApi } from '../../services/item.service';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

function ListingCard({ listing, onToggle, onPress, onDelete }) {
  const handleMore = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'View Details', 'Delete Listing'], destructiveButtonIndex: 2, cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) onPress(); if (idx === 2) onDelete(); }
      );
    } else {
      Alert.alert('Options', listing.title, [
        { text: 'View Details', onPress },
        { text: 'Delete Listing', style: 'destructive', onPress: onDelete },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Photo */}
      <View style={styles.cardPhoto}>
        {listing.image ? (
          <Image source={{ uri: `${BASE_URL}/${listing.image}` }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: listing.placeholderColor }]}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
          </View>
        )}
        <View style={[styles.statusPill, listing.isActive ? styles.statusPillActive : styles.statusPillPaused]}>
          <Text style={styles.statusPillText}>{listing.isActive ? 'Active' : 'Paused'}</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.priceText}>₹{listing.pricePerDay}<Text style={styles.priceUnit}>/day</Text></Text>

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

        {/* Availability */}
        {(listing.availableFrom || listing.availableTo) && (
          <View style={styles.availabilityRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={styles.availabilityText}>
              {formatDate(listing.availableFrom)} – {formatDate(listing.availableTo) || '...'}
            </Text>
          </View>
        )}

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
      <TouchableOpacity style={styles.moreBtn} onPress={handleMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MyListingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchListings = async () => {
    try {
      const res = await getMyItemsApi();
      const items = res.data.map((item) => ({
        id:            item._id,
        title:         item.title,
        description:   item.description,
        pricePerDay:   item.pricePerDay ?? item.price,
        isActive:      item.isAvailable !== false,
        views:         item.views || 0,
        bookings:      item.bookingCount || 0,
        image:         item.images?.[0] || null,
        images:        item.images || [],
        availableFrom: item.availableFrom || null,
        availableTo:   item.availableTo   || null,
        location:      item.location || null,
        category:      item.category || null,
        placeholderColor: '#E8F4F8',
      }));
      setListings(items);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Refresh list every time screen comes into focus (e.g. after adding a listing)
  useFocusEffect(useCallback(() => { fetchListings(); }, []));

  const toggleListing = (id) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l)));
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteItemApi(id);
              setListings((prev) => prev.filter((l) => l.id !== id));
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete listing');
            }
          },
        },
      ]
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} size="large" color={colors.primary} />
      ) : listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>Start earning by listing your items for rent.</Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={() => navigation.navigate('AddListing')} activeOpacity={0.85}>
            <Text style={styles.addFirstBtnText}>Add First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {listings.map((listing, idx) =>
            idx % 2 === 0 ? (
              <View key={listing.id} style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <ListingCard
                    listing={listing}
                    onToggle={() => toggleListing(listing.id)}
                    onPress={() => navigation.navigate('ListingDetail', { listing })}
                    onDelete={() => handleDelete(listing.id, listing.title)}
                  />
                </View>
                {listings[idx + 1] ? (
                  <View style={styles.gridCell}>
                    <ListingCard
                      listing={listings[idx + 1]}
                      onToggle={() => toggleListing(listings[idx + 1].id)}
                      onPress={() => navigation.navigate('ListingDetail', { listing: listings[idx + 1] })}
                      onDelete={() => handleDelete(listings[idx + 1].id, listings[idx + 1].title)}
                    />
                  </View>
                ) : (
                  <View style={styles.gridCell} />
                )}
              </View>
            ) : null
          )}
          <View style={{ height: spacing.xxxl + spacing.xxxl }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { bottom: spacing.xl + insets.bottom }]} onPress={() => navigation.navigate('AddListing')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background,
  },
  backBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerRight:   { width: 36 },
  summaryBar:    { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText:   { ...typography.bodySmall, color: colors.textSecondary },
  summaryActive: { color: colors.success, fontWeight: '600' },
  grid:          { padding: spacing.md },
  gridRow:       { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  gridCell:      { flex: 1 },
  card:          { backgroundColor: colors.background, borderRadius: radius.lg, overflow: 'hidden', ...shadows.small, position: 'relative' },
  cardPhoto:     { height: 110, position: 'relative', overflow: 'hidden' },
  cardImage:     { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  statusPill:        { position: 'absolute', bottom: spacing.sm, left: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  statusPillActive:  { backgroundColor: colors.success },
  statusPillPaused:  { backgroundColor: colors.textMuted },
  statusPillText:    { ...typography.caption, fontWeight: '700', color: colors.textInverse },
  cardBody:      { padding: spacing.md, gap: spacing.xs },
  cardTitle:     { ...typography.caption, fontWeight: '600', color: colors.textPrimary, lineHeight: 16 },
  priceText:     { ...typography.body, fontWeight: '700', color: colors.primary },
  priceUnit:     { ...typography.caption, fontWeight: '400', color: colors.textSecondary },
  statsRow:      { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  statItem:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText:      { ...typography.caption, color: colors.textSecondary },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryLight, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  availabilityText: { ...typography.caption, color: colors.primary, fontWeight: '600', fontSize: 10 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  toggleLabel:        { ...typography.caption, fontWeight: '600' },
  toggleLabelActive:  { color: colors.success },
  toggleLabelPaused:  { color: colors.textMuted },
  moreBtn:       { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 28, height: 28, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  emptyTitle:    { ...typography.h3, color: colors.textSecondary },
  emptySubtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  addFirstBtn:   { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  addFirstBtnText: { ...typography.button, color: colors.textInverse },
  fab:           { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 56, height: 56, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.large },
});
