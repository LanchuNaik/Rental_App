// ============================================
// ReviewSubmitScreen — Post-rental review submission
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { createReviewApi } from '../../services/review.service';
import { getBookingByIdApi } from '../../services/booking.service';

function StarRating({ rating, onRate }) {
  return (
    <View style={styles.starSection}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRate(star)}
            activeOpacity={0.7}
            style={styles.starBtn}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? '#F59E0B' : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.starRatingText}>
        {rating === 0
          ? 'Tap to rate'
          : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
      </Text>
    </View>
  );
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ReviewSubmitScreen({ navigation, route }) {
  const { bookingId } = route?.params || {};
  const [itemRating,  setItemRating]  = useState(0);
  const [reviewText,  setReviewText]  = useState('');
  const [textFocused, setTextFocused] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [booking,     setBooking]     = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoadingBooking(false); return; }
    const fetchBooking = async () => {
      try {
        const res = await getBookingByIdApi(bookingId);
        setBooking(res.data?.booking || res.data);
      } catch {
        // silently ignore — we can still show review form
      } finally {
        setLoadingBooking(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const canSubmit = itemRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing Rating', 'Please rate the item before submitting.');
      return;
    }
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing.');
      return;
    }
    setSubmitting(true);
    try {
      await createReviewApi(bookingId, itemRating, reviewText.trim());
      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review helps the Rentr community.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const itemTitle    = booking?.item?.title || 'Item';
  const ownerName    = booking?.owner?.name || 'Owner';
  const bookingRef   = booking ? `#RNT-${booking._id?.slice(-6).toUpperCase()}` : '';
  const rentalPeriod = booking
    ? `${new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Item Card */}
        {!loadingBooking && (
          <View style={styles.itemCard}>
            <View style={[styles.itemPhoto, { backgroundColor: '#BFDBFE' }]}>
              <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{itemTitle}</Text>
              {rentalPeriod ? <Text style={styles.itemMeta}>Rented {rentalPeriod}</Text> : null}
              {bookingRef ? (
                <View style={styles.refRow}>
                  <Ionicons name="receipt-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.refText}>{bookingRef}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Item Rating */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingCardHeader}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
            <Text style={styles.ratingCardTitle}>Rate the Item</Text>
          </View>
          <Text style={styles.ratingCardSubtitle}>
            How was the condition and quality of the item?
          </Text>
          <StarRating rating={itemRating} onRate={setItemRating} />
        </View>

        {/* Written Review */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Written Review</Text>
          <TextInput
            style={[styles.reviewInput, textFocused && styles.reviewInputFocused]}
            placeholder="Share your experience with this item. Was it as described? Any tips for future renters?"
            placeholderTextColor={colors.textMuted}
            value={reviewText}
            onChangeText={setReviewText}
            onFocus={() => setTextFocused(true)}
            onBlur={() => setTextFocused(false)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{reviewText.length}/500</Text>
        </View>

        {/* Owner info */}
        {ownerName && (
          <View style={styles.ownerNote}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{getInitials(ownerName)}</Text>
            </View>
            <View>
              <Text style={styles.ownerNoteTitle}>Rented from {ownerName}</Text>
              <View style={styles.publicNote}>
                <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
                <Text style={styles.publicNoteText}>Reviews are public and visible to all users</Text>
              </View>
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={canSubmit ? colors.textInverse : colors.textMuted}
              />
              <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
                Submit Review
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!canSubmit && (
          <Text style={styles.submitHint}>Please rate the item to submit</Text>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerRight:{ width: 36 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.small,
  },
  itemPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemInfo: { flex: 1, gap: spacing.xs },
  itemTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  itemMeta: { ...typography.bodySmall, color: colors.textSecondary },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  refText: { ...typography.caption, color: colors.textMuted },
  ratingCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  ratingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ratingCardTitle: { ...typography.h3, color: colors.textPrimary },
  ratingCardSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: -spacing.sm },
  starSection: { alignItems: 'center', gap: spacing.sm },
  starsRow: { flexDirection: 'row', gap: spacing.sm },
  starBtn: { padding: spacing.xs },
  starRatingText: { ...typography.body, fontWeight: '600', color: colors.textSecondary },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  sectionTitle: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  reviewInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
    backgroundColor: colors.surface,
  },
  reviewInputFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  charCount: { ...typography.caption, color: colors.textMuted, textAlign: 'right', marginTop: -spacing.sm },
  ownerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ownerAvatarText: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  ownerNoteTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  publicNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  publicNoteText: { ...typography.caption, color: colors.textMuted },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  submitBtnDisabled: { backgroundColor: colors.border, ...shadows.small },
  submitBtnText: { ...typography.button, color: colors.textInverse },
  submitBtnTextDisabled: { color: colors.textMuted },
  submitHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
});
