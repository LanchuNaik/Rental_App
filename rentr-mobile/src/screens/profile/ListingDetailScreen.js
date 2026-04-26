// ============================================
// ListingDetailScreen — Owner's listing detail
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getItemByIdApi, deleteItemApi } from '../../services/item.service';
import { imageUrl } from '../../utils/imageUrl';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ListingDetailScreen({ navigation, route }) {
  const initialListing = route.params.listing;
  const [listing,     setListing]     = useState(initialListing);
  const [loadingItem, setLoadingItem] = useState(true);
  const [deleting,    setDeleting]    = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // Re-fetch from API every time screen comes into focus (e.g. after editing)
  useFocusEffect(useCallback(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemByIdApi(initialListing.id);
        const item = res.data;
        setListing({
          id:            item._id,
          title:         item.title,
          description:   item.description,
          pricePerDay:   item.price,
          isActive:      item.isAvailable !== false,
          views:         item.views || 0,
          bookings:      item.bookingCount || 0,
          images:        item.images || [],
          availableFrom: item.availableFrom || null,
          availableTo:   item.availableTo   || null,
          location:      item.location      || null,
          category:      item.category      || null,
        });
      } catch {
        // keep showing previous data on error
      } finally {
        setLoadingItem(false);
      }
    };
    fetchItem();
  }, [initialListing.id]));

  const photos = listing.images?.length > 0 ? listing.images : [];

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteItemApi(listing.id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{listing.title}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditListing', { listing: { ...listing, id: listing.id || initialListing.id } })}
          style={styles.actionBtn}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loadingItem && (
        <ActivityIndicator
          style={{ position: 'absolute', alignSelf: 'center', top: '50%', zIndex: 10 }}
          size="large"
          color={colors.primary}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Photo carousel */}
        <View style={styles.photoArea}>
          {photos.length > 0 ? (
            <Image
              source={{ uri: imageUrl(photos[activePhoto]) }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={56} color={colors.textMuted} />
              <Text style={styles.photoPlaceholderText}>No photos added</Text>
            </View>
          )}

          {/* Status pill */}
          <View style={[styles.statusPill, listing.isActive ? styles.statusPillActive : styles.statusPillPaused]}>
            <Text style={styles.statusPillText}>{listing.isActive ? 'Active' : 'Paused'}</Text>
          </View>

          {/* Photo dots */}
          {photos.length > 1 && (
            <View style={styles.photoDots}>
              {photos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActivePhoto(i)}>
                  <View style={[styles.photoDot, activePhoto === i && styles.photoDotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Title & Price */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            {listing.category ? <Text style={styles.category}>{listing.category}</Text> : null}
            <Text style={styles.title}>{listing.title}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.price}>₹{listing.pricePerDay}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          {listing.availableFrom || listing.availableTo ? (
            <>
              <InfoRow icon="calendar-outline" label="Available From" value={formatDate(listing.availableFrom)} />
              <View style={styles.infoDivider} />
              <InfoRow icon="calendar"         label="Available To"   value={formatDate(listing.availableTo)} />
              <View style={styles.infoDivider} />
            </>
          ) : (
            <>
              <View style={styles.noDateRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={styles.noDateText}>No availability dates set — tap ✏️ to add</Text>
              </View>
              <View style={styles.infoDivider} />
            </>
          )}
          <InfoRow icon="location-outline" label="Location" value={listing.location?.address || 'Not set'} />
        </View>

        {/* Description */}
        {listing.description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </>
        ) : null}

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{listing.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{listing.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteFullBtn} onPress={handleDelete} activeOpacity={0.85} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={colors.textInverse} />
              <Text style={styles.deleteFullBtnText}>Delete Listing</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content:     { padding: spacing.lg, gap: spacing.lg },
  // Photo
  photoArea:   { borderRadius: radius.xl, overflow: 'hidden', height: 240, backgroundColor: colors.surface, position: 'relative' },
  photo:       { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  photoPlaceholderText: { ...typography.bodySmall, color: colors.textMuted },
  statusPill:       { position: 'absolute', top: spacing.md, left: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  statusPillActive: { backgroundColor: colors.success },
  statusPillPaused: { backgroundColor: colors.textMuted },
  statusPillText:   { ...typography.caption, fontWeight: '700', color: colors.textInverse },
  photoDots:   { position: 'absolute', bottom: spacing.md, alignSelf: 'center', flexDirection: 'row', gap: spacing.sm },
  photoDot:    { width: 6, height: 6, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoDotActive: { width: 18, backgroundColor: colors.textInverse },
  // Title
  titleSection: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  category:    { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title:       { ...typography.h2, color: colors.textPrimary },
  priceBox:    { alignItems: 'flex-end' },
  price:       { ...typography.h2, color: colors.primary, fontWeight: '700' },
  priceUnit:   { ...typography.caption, color: colors.textSecondary },
  // Info card
  infoCard:    { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel:   { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  infoValue:   { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, textAlign: 'right', flexShrink: 1 },
  infoDivider: { height: 1, backgroundColor: colors.border },
  noDateRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  noDateText:  { ...typography.bodySmall, color: colors.textMuted, flex: 1, fontStyle: 'italic' },
  // Description
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  description:  { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  // Stats
  statsCard:   { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  statItem:    { flex: 1, alignItems: 'center', gap: 4 },
  statValue:   { ...typography.h2, color: colors.textPrimary, fontWeight: '700' },
  statLabel:   { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, backgroundColor: colors.border },
  // Delete button
  deleteFullBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, ...shadows.small,
  },
  deleteFullBtnText: { ...typography.button, color: colors.textInverse },
});
