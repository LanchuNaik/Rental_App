// ============================================
// ReviewSubmitScreen — Post-rental review submission
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

function StarRating({ rating, onRate, label }) {
  return (
    <View style={styles.starSection}>
      {label && <Text style={styles.starLabel}>{label}</Text>}
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

export default function ReviewSubmitScreen({ navigation }) {
  const [itemRating, setItemRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [textFocused, setTextFocused] = useState(false);

  const canSubmit = itemRating > 0 && ownerRating > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Missing Rating', 'Please rate both the item and the owner before submitting.');
      return;
    }
    Alert.alert(
      'Review Submitted!',
      'Thank you for your feedback. Your review helps the Rentr community.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Item Card */}
        <View style={styles.itemCard}>
          <View style={[styles.itemPhoto, { backgroundColor: '#BFDBFE' }]}>
            <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>Sony A7 III Camera</Text>
            <Text style={styles.itemMeta}>Rented Apr 15 – Apr 18, 2026</Text>
            <View style={styles.refRow}>
              <Ionicons name="receipt-outline" size={13} color={colors.textMuted} />
              <Text style={styles.refText}>#RNT-2026-00142</Text>
            </View>
          </View>
        </View>

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

        {/* Owner Rating */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingCardHeader}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>AR</Text>
            </View>
            <View>
              <Text style={styles.ratingCardTitle}>Rate the Owner</Text>
              <Text style={styles.ownerName}>Alex Rivera</Text>
            </View>
          </View>
          <Text style={styles.ratingCardSubtitle}>
            How was the owner's communication and service?
          </Text>
          <StarRating rating={ownerRating} onRate={setOwnerRating} />
          <View style={styles.publicNote}>
            <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
            <Text style={styles.publicNoteText}>Reviews are public and visible to all users</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={canSubmit ? colors.textInverse : colors.textMuted}
          />
          <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
            Submit Review
          </Text>
        </TouchableOpacity>

        {!canSubmit && (
          <Text style={styles.submitHint}>Please rate both the item and owner to submit</Text>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
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
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  refText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ratingCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  ratingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ratingCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  ratingCardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ownerName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  starSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  starLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starBtn: {
    padding: spacing.xs,
  },
  starRatingText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
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
  reviewInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.sm,
  },
  publicNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  publicNoteText: {
    ...typography.caption,
    color: colors.textMuted,
  },
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
  submitBtnDisabled: {
    backgroundColor: colors.border,
    ...shadows.small,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
  submitBtnTextDisabled: {
    color: colors.textMuted,
  },
  submitHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
});
