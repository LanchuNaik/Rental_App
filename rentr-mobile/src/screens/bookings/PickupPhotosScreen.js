// ============================================
// PickupPhotosScreen — Record item condition at pickup
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const MOCK_THUMBNAILS = [
  { id: 't1', color: '#BFDBFE', label: 'Front view' },
  { id: 't2', color: '#BBF7D0', label: 'Side view' },
];

export default function PickupPhotosScreen({ navigation }) {
  const [photos, setPhotos] = useState(MOCK_THUMBNAILS);
  const canConfirm = photos.length > 0;

  const handleTakePhoto = () => {
    Alert.alert('Camera', 'Camera access would open here.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Simulate Add',
        onPress: () => {
          const colors_list = ['#FDE68A', '#DDD6FE', '#FBCFE8', '#CFFAFE'];
          const newPhoto = {
            id: `t${Date.now()}`,
            color: colors_list[photos.length % colors_list.length],
            label: `Photo ${photos.length + 1}`,
          };
          setPhotos((prev) => [...prev, newPhoto]);
        },
      },
    ]);
  };

  const handleUploadGallery = () => {
    Alert.alert('Gallery', 'Photo library access would open here.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Simulate Add',
        onPress: () => {
          const newPhoto = {
            id: `g${Date.now()}`,
            color: '#FEF9C3',
            label: `Gallery ${photos.length + 1}`,
          };
          setPhotos((prev) => [...prev, newPhoto]);
        },
      },
    ]);
  };

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    Alert.alert(
      'Pickup Confirmed!',
      'Item condition has been recorded. Enjoy your rental!',
      [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Photos</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <Text style={styles.instructionText}>
            Take photos of the item before pickup — these protect both you and the owner
          </Text>
        </View>

        {/* Camera Placeholder */}
        <TouchableOpacity style={styles.cameraBox} onPress={handleTakePhoto} activeOpacity={0.8}>
          <View style={styles.cameraInner}>
            <Ionicons name="camera" size={56} color={colors.textMuted} />
            <Text style={styles.cameraTitle}>Take a Photo</Text>
            <Text style={styles.cameraSubtitle}>Tap to open camera</Text>
          </View>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          {[
            'Capture all sides of the item',
            'Include any existing scratches or damage',
            'Ensure good lighting for clear photos',
            'Take at least 3 photos for full coverage',
          ].map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleTakePhoto} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.actionBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleUploadGallery} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionBtnSecondaryText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Count Info */}
        <View style={styles.countRow}>
          <Ionicons name="images-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.countText}>{photos.length} photo{photos.length !== 1 ? 's' : ''} added</Text>
        </View>

        {/* Thumbnail Strip */}
        {photos.length > 0 && (
          <View style={styles.thumbnailSection}>
            <Text style={styles.thumbnailTitle}>Captured Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}
            >
              {photos.map((photo) => (
                <View key={photo.id} style={styles.thumbnailWrapper}>
                  <View style={[styles.thumbnail, { backgroundColor: photo.color }]}>
                    <Ionicons name="image" size={24} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.thumbnailLabel} numberOfLines={1}>{photo.label}</Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add more placeholder */}
              <TouchableOpacity style={styles.addMoreBox} onPress={handleTakePhoto}>
                <Ionicons name="add" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: spacing.xxxl + spacing.xl }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        {!canConfirm && (
          <Text style={styles.footerHint}>Add at least 1 photo to confirm pickup</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={canConfirm ? handleConfirm : undefined}
          activeOpacity={canConfirm ? 0.85 : 1}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={canConfirm ? colors.textInverse : colors.textMuted}
          />
          <Text style={[styles.confirmBtnText, !canConfirm && styles.confirmBtnTextDisabled]}>
            Confirm Pickup
          </Text>
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
    ...typography.body,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 22,
  },
  cameraBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  cameraInner: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  cameraTitle: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  cameraSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  tipsCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.sm,
  },
  tipsTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
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
  actionBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionBtnSecondaryText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  thumbnailSection: {
    gap: spacing.sm,
  },
  thumbnailTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  thumbnailStrip: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  thumbnailWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  thumbnailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: 88,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.background,
    borderRadius: radius.full,
  },
  addMoreBox: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
    gap: spacing.sm,
  },
  footerHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
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
  confirmBtnDisabled: {
    backgroundColor: colors.border,
    ...shadows.small,
  },
  confirmBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
  confirmBtnTextDisabled: {
    color: colors.textMuted,
  },
});
