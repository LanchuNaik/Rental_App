// ============================================
// Item Detail Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MOCK_ITEM = {
  id: '1', title: 'Canon EOS R6 Camera', price: 65, deposit: 200,
  category: 'Cameras', rating: 4.8, reviews: 24, distance: '1.2 km',
  description: 'Professional mirrorless camera perfect for events, travel photography, and video. Comes with 24-105mm lens, extra battery, and camera bag. Perfect condition — cleaned before every rental.',
  owner: { name: 'Alex Martinez', rating: 4.9, rentals: 47, avatar: 'AM' },
  photos: [1, 2, 3],
};

export default function ItemDetailScreen({ navigation }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSaved,     setIsSaved]     = useState(false);
  const item = MOCK_ITEM;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Photo carousel */}
      <View style={styles.photoCarousel}>
        <View style={styles.photoPlaceholder}>
          <Ionicons name="camera" size={60} color={colors.textMuted} />
          <Text style={styles.photoCount}>Photo {activePhoto + 1} of {item.photos.length}</Text>
        </View>

        {/* Pagination dots */}
        <View style={styles.photoDots}>
          {item.photos.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setActivePhoto(i)}>
              <View style={[styles.photoDot, activePhoto === i && styles.photoDotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Top overlay buttons */}
        <View style={styles.photoOverlay}>
          <TouchableOpacity style={styles.overlayBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayBtn} onPress={() => setIsSaved(!isSaved)}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color={isSaved ? colors.error : colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title + rating */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{item.distance} away</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.reviews} reviews</Text>
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Per day</Text>
            <Text style={styles.pricingValue}>${item.price}</Text>
          </View>
          <View style={styles.pricingDivider} />
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Deposit</Text>
            <Text style={styles.pricingValue}>${item.deposit}</Text>
          </View>
        </View>

        {/* Owner card */}
        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>{item.owner.avatar}</Text>
          </View>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{item.owner.name}</Text>
            <View style={styles.ownerMeta}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ownerMetaText}>{item.owner.rating} · {item.owner.rentals} rentals</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.messageBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>About this item</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Availability */}
        <TouchableOpacity
          style={styles.availabilityButton}
          onPress={() => navigation.navigate('AvailabilityCalendar', { itemId: item.id })}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.availabilityText}>Check availability</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Book Now footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceAmount}>${item.price}</Text>
          <Text style={styles.footerPriceLabel}>/day</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('AvailabilityCalendar', { itemId: item.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  photoCarousel:   { height: 300, backgroundColor: colors.surface, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholder:{ alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  photoCount:      { ...typography.caption, color: colors.textMuted },
  photoDots:       { position: 'absolute', bottom: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  photoDot:        { width: 6, height: 6, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoDotActive:  { width: 18, backgroundColor: colors.textInverse },
  photoOverlay:    { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' },
  overlayBtn:      { width: 40, height: 40, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...shadows.small },
  content:         { flex: 1, paddingHorizontal: spacing.xl },
  titleRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.xl },
  titleLeft:       { flex: 1, marginRight: spacing.md },
  category:        { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  title:           { ...typography.h2, color: colors.textPrimary },
  ratingBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  ratingText:      { ...typography.bodySmall, fontWeight: '700', color: '#92400E' },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xl },
  metaText:        { ...typography.bodySmall, color: colors.textMuted },
  metaDot:         { color: colors.textMuted },
  pricingCard:     { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  pricingItem:     { flex: 1, alignItems: 'center' },
  pricingLabel:    { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  pricingValue:    { ...typography.h2, color: colors.primary },
  pricingDivider:  { width: 1, backgroundColor: colors.border },
  ownerCard:       { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  ownerAvatar:     { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  ownerAvatarText: { ...typography.body, fontWeight: '700', color: colors.textInverse },
  ownerInfo:       { flex: 1 },
  ownerName:       { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  ownerMeta:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ownerMetaText:   { ...typography.caption, color: colors.textSecondary },
  messageBtn:      { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:    { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  description:     { ...typography.body, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.xl },
  availabilityButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.primaryLight, borderRadius: radius.lg, marginBottom: spacing.xl },
  availabilityText:{ ...typography.body, fontWeight: '600', color: colors.primary, flex: 1, marginLeft: spacing.md },
  footer:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  footerPrice:     { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  footerPriceAmount: { ...typography.h2, color: colors.textPrimary },
  footerPriceLabel:  { ...typography.body, color: colors.textSecondary },
  bookButton:      { flex: 1, marginLeft: spacing.xl, backgroundColor: colors.accent, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  bookButtonText:  { ...typography.button, color: colors.textInverse },
});
