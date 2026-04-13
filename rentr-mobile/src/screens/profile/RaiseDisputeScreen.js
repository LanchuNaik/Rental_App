// ============================================
// RaiseDisputeScreen — Dispute submission form
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

const DISPUTE_REASONS = [
  { key: 'damaged', label: 'Item damaged', icon: 'warning-outline' },
  { key: 'not_as_described', label: 'Item not as described', icon: 'alert-circle-outline' },
  { key: 'not_returned', label: 'Item not returned', icon: 'return-down-back-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

const MOCK_BOOKING = {
  ref: '#RNT-2026-00142',
  item: 'Sony A7 III Camera',
  dates: 'Apr 15 – Apr 18, 2026',
  amount: '$120.00',
  otherParty: 'Alex Rivera',
};

function RadioOption({ option, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.radioOptionSelected]}
      onPress={() => onSelect(option.key)}
      activeOpacity={0.8}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInnerDot} />}
      </View>
      <Ionicons
        name={option.icon}
        size={18}
        color={selected ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );
}

function SuccessState({ caseNumber, onDone }) {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconWrapper}>
        <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
      </View>
      <Text style={styles.successTitle}>Dispute Submitted</Text>
      <Text style={styles.successSubtitle}>
        Our team will review your case and respond within 2-3 business days.
      </Text>
      <View style={styles.caseCard}>
        <Text style={styles.caseLabel}>Case Number</Text>
        <Text style={styles.caseNumber}>{caseNumber}</Text>
        <Text style={styles.caseInfo}>Reference this number in all communications with support.</Text>
      </View>
      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
        <Text style={styles.doneBtnText}>Back to Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RaiseDisputeScreen({ navigation }) {
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState('');
  const [descFocused, setDescFocused] = useState(false);
  const [evidencePhotos, setEvidencePhotos] = useState([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber] = useState(`DSP-${Date.now().toString().slice(-6)}`);

  const canSubmit = reason && description.trim().length >= 20;

  const handleAddPhoto = (idx) => {
    Alert.alert('Add Evidence', 'Camera or gallery would open here.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Simulate Add',
        onPress: () => {
          const colors_list = ['#BFDBFE', '#BBF7D0', '#FDE68A'];
          const newPhotos = [...evidencePhotos];
          newPhotos[idx] = { color: colors_list[idx] };
          setEvidencePhotos(newPhotos);
        },
      },
    ]);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Incomplete', 'Please select a reason and provide a description (at least 20 characters).');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispute Filed</Text>
          <View style={styles.headerRight} />
        </View>
        <SuccessState
          caseNumber={caseNumber}
          onDone={() => navigation.navigate('MyBookings')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a Dispute</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Disputes should be raised within 48 hours of item return. Please provide as much detail as possible.
          </Text>
        </View>

        {/* Booking Reference Card */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingCardHeader}>
            <Ionicons name="receipt-outline" size={18} color={colors.primary} />
            <Text style={styles.bookingRef}>{MOCK_BOOKING.ref}</Text>
          </View>
          <View style={styles.bookingDetails}>
            <View style={styles.bookingDetailRow}>
              <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.bookingDetailText}>{MOCK_BOOKING.item}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.bookingDetailText}>{MOCK_BOOKING.dates}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.bookingDetailText}>{MOCK_BOOKING.otherParty}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.bookingDetailText}>{MOCK_BOOKING.amount}</Text>
            </View>
          </View>
        </View>

        {/* Reason Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reason for Dispute</Text>
          <Text style={styles.sectionSubtitle}>Select the reason that best describes the issue.</Text>
          <View style={styles.radioGroup}>
            {DISPUTE_REASONS.map((opt) => (
              <RadioOption
                key={opt.key}
                option={opt}
                selected={reason === opt.key}
                onSelect={setReason}
              />
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Describe the Issue</Text>
          <Text style={styles.sectionSubtitle}>Provide a detailed description of what happened (min. 20 characters).</Text>
          <TextInput
            style={[styles.descInput, descFocused && styles.descInputFocused]}
            placeholder="E.g. The lens had a crack that was not present at pickup. I noticed it when returning the camera..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
          />
          <View style={styles.descFooter}>
            <Text style={[
              styles.descCount,
              description.length < 20 && description.length > 0 && styles.descCountWarning,
            ]}>
              {description.length}/1000 {description.length < 20 && description.length > 0 ? `(${20 - description.length} more needed)` : ''}
            </Text>
          </View>
        </View>

        {/* Photo Evidence */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
          <Text style={styles.sectionSubtitle}>Upload photos to support your dispute (optional but recommended).</Text>
          <View style={styles.evidenceGrid}>
            {evidencePhotos.map((photo, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.evidenceBox, photo && { backgroundColor: photo.color }]}
                onPress={() => handleAddPhoto(idx)}
                activeOpacity={0.8}
              >
                {photo ? (
                  <>
                    <Ionicons name="image" size={28} color={colors.textSecondary} />
                    <Text style={styles.evidenceLabel}>Photo {idx + 1}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
                    <Text style={styles.evidenceLabel}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
        >
          <Ionicons
            name="shield-outline"
            size={20}
            color={canSubmit ? colors.textInverse : colors.textMuted}
          />
          <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
            Submit Dispute
          </Text>
        </TouchableOpacity>

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
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    ...typography.bodySmall,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  bookingCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookingRef: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  bookingDetails: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookingDetailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
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
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    lineHeight: 20,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  radioLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  descInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
    backgroundColor: colors.surface,
  },
  descInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  descFooter: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
  },
  descCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  descCountWarning: {
    color: colors.warning,
  },
  evidenceGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  evidenceBox: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 6,
  },
  evidenceLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
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
  // Success State
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  caseLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caseNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  caseInfo: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    width: '100%',
    alignItems: 'center',
    ...shadows.medium,
  },
  doneBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
