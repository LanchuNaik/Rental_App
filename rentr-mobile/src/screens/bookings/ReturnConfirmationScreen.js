// ============================================
// ReturnConfirmationScreen — Owner confirms item return
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

const MOCK_PICKUP_PHOTOS = [
  { id: 'p1', color: '#BFDBFE', label: 'Front' },
  { id: 'p2', color: '#BBF7D0', label: 'Side' },
];

export default function ReturnConfirmationScreen({ navigation }) {
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [damageNote, setDamageNote] = useState('');
  const [noteFocused, setNoteFocused] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleTakeReturnPhoto = () => {
    Alert.alert('Camera', 'Camera access would open here.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Simulate Add',
        onPress: () => {
          const photoColors = ['#FDE68A', '#DDD6FE', '#FBCFE8', '#CFFAFE', '#FEF9C3'];
          const newPhoto = {
            id: `rp${Date.now()}`,
            color: photoColors[returnPhotos.length % photoColors.length],
            label: `Return ${returnPhotos.length + 1}`,
          };
          setReturnPhotos((prev) => [...prev, newPhoto]);
        },
      },
    ]);
  };

  const handleConfirmReturn = () => {
    Alert.alert(
      'Confirm Return',
      'This will mark the item as returned and release payment to your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => setConfirmed(true),
        },
      ]
    );
  };

  if (confirmed) {
    return (
      <Screen>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Return Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Payment released to your account within 2-3 business days.
          </Text>
          <View style={styles.successCard}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <View style={styles.successCardText}>
              <Text style={styles.successCardTitle}>Payment Processing</Text>
              <Text style={styles.successCardBody}>
                Your earnings will appear in your Rentr wallet and can be transferred to your bank account.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('MyBookings')}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Confirm Return</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.instructionText}>
            Compare the item's return condition against pickup photos before confirming.
          </Text>
        </View>

        {/* Condition Comparison */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Condition Comparison</Text>
          <View style={styles.comparisonRow}>
            {/* Pickup Photos */}
            <View style={styles.comparisonCol}>
              <View style={styles.comparisonHeader}>
                <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.comparisonLabel}>Pickup Condition</Text>
              </View>
              <View style={styles.comparisonPhotos}>
                {MOCK_PICKUP_PHOTOS.map((p) => (
                  <View key={p.id} style={[styles.conditionPhoto, { backgroundColor: p.color }]}>
                    <Ionicons name="image" size={20} color={colors.textSecondary} />
                    <Text style={styles.conditionPhotoLabel}>{p.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.comparisonDivider}>
              <Ionicons name="swap-horizontal" size={20} color={colors.textMuted} />
            </View>

            {/* Return Photos */}
            <View style={styles.comparisonCol}>
              <View style={styles.comparisonHeader}>
                <Ionicons name="log-in-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.comparisonLabel}>Return Condition</Text>
              </View>
              <View style={styles.comparisonPhotos}>
                {returnPhotos.length === 0 ? (
                  <TouchableOpacity style={styles.addReturnPhoto} onPress={handleTakeReturnPhoto}>
                    <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
                    <Text style={styles.addReturnPhotoText}>Add photo</Text>
                  </TouchableOpacity>
                ) : (
                  returnPhotos.slice(0, 2).map((p) => (
                    <View key={p.id} style={[styles.conditionPhoto, { backgroundColor: p.color }]}>
                      <Ionicons name="image" size={20} color={colors.textSecondary} />
                      <Text style={styles.conditionPhotoLabel}>{p.label}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Take Return Photos Button */}
        <TouchableOpacity style={styles.takePhotoBtn} onPress={handleTakeReturnPhoto} activeOpacity={0.85}>
          <Ionicons name="camera" size={20} color={colors.primary} />
          <Text style={styles.takePhotoBtnText}>
            Take Return Photos {returnPhotos.length > 0 ? `(${returnPhotos.length})` : ''}
          </Text>
        </TouchableOpacity>

        {/* Return Photo Strip */}
        {returnPhotos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
          >
            {returnPhotos.map((p) => (
              <View key={p.id} style={[styles.stripThumb, { backgroundColor: p.color }]}>
                <Ionicons name="image" size={20} color={colors.textSecondary} />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Damage Note */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Damage / Issue Notes (optional)</Text>
          <TextInput
            style={[
              styles.noteInput,
              noteFocused && styles.noteInputFocused,
            ]}
            placeholder="Describe any damage or issues with the returned item..."
            placeholderTextColor={colors.textMuted}
            value={damageNote}
            onChangeText={setDamageNote}
            onFocus={() => setNoteFocused(true)}
            onBlur={() => setNoteFocused(false)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfoCard}>
          <Ionicons name="wallet-outline" size={20} color={colors.success} />
          <View style={styles.paymentInfoText}>
            <Text style={styles.paymentInfoTitle}>Payment Release</Text>
            <Text style={styles.paymentInfoBody}>
              Confirming return will release $120.00 to your account within 2-3 business days.
            </Text>
          </View>
        </View>

        <View style={{ height: spacing.xxxl + spacing.xl }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmReturn}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
          <Text style={styles.confirmBtnText}>Confirm Return & Release Payment</Text>
        </TouchableOpacity>
      </View>
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
  instructionBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  comparisonCol: {
    flex: 1,
    gap: spacing.sm,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  comparisonLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  comparisonPhotos: {
    gap: spacing.sm,
  },
  conditionPhoto: {
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  conditionPhotoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  comparisonDivider: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  addReturnPhoto: {
    height: 72,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
  },
  addReturnPhotoText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  takePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  takePhotoBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  photoStrip: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stripThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 100,
    backgroundColor: colors.surface,
  },
  noteInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  paymentInfoCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  paymentInfoText: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentInfoTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#065F46',
  },
  paymentInfoBody: {
    ...typography.bodySmall,
    color: '#047857',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  confirmBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIconWrapper: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  successCardText: {
    flex: 1,
    gap: spacing.xs,
  },
  successCardTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  successCardBody: {
    ...typography.bodySmall,
    color: colors.primary,
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.medium,
  },
  doneBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
