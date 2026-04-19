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
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { uploadPickupPhotosApi } from '../../services/booking.service';

export default function PickupPhotosScreen({ navigation, route }) {
  const { bookingId } = route?.params || {};
  const [photos, setPhotos] = useState([]); // array of { uri }
  const [uploading, setUploading] = useState(false);
  const canConfirm = photos.length > 0;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => ({ uri: a.uri }))]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing.');
      return;
    }
    setUploading(true);
    try {
      await uploadPickupPhotosApi(bookingId, photos.map((p) => p.uri));
      Alert.alert(
        'Pickup Confirmed!',
        'Item condition has been recorded. Enjoy your rental!',
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
      );
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Photos</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.instructionBanner}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <Text style={styles.instructionText}>
            Take photos of the item before pickup — these protect both you and the owner
          </Text>
        </View>

        <TouchableOpacity style={styles.cameraBox} onPress={takePhoto} activeOpacity={0.8}>
          <View style={styles.cameraInner}>
            <Ionicons name="camera" size={56} color={colors.textMuted} />
            <Text style={styles.cameraTitle}>Take a Photo</Text>
            <Text style={styles.cameraSubtitle}>Tap to open camera</Text>
          </View>
        </TouchableOpacity>

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

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={takePhoto} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.actionBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={pickFromLibrary} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionBtnSecondaryText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countRow}>
          <Ionicons name="images-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.countText}>{photos.length} photo{photos.length !== 1 ? 's' : ''} added</Text>
        </View>

        {photos.length > 0 && (
          <View style={styles.thumbnailSection}>
            <Text style={styles.thumbnailTitle}>Captured Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}
            >
              {photos.map((photo, idx) => (
                <View key={idx} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePhoto(idx)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addMoreBox} onPress={takePhoto}>
                <Ionicons name="add" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        <View style={{ height: spacing.xxxl + spacing.xl }} />
      </ScrollView>

      <View style={styles.footer}>
        {!canConfirm && (
          <Text style={styles.footerHint}>Add at least 1 photo to confirm pickup</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={canConfirm ? handleConfirm : undefined}
          activeOpacity={canConfirm ? 0.85 : 1}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={canConfirm ? colors.textInverse : colors.textMuted}
              />
              <Text style={[styles.confirmBtnText, !canConfirm && styles.confirmBtnTextDisabled]}>
                Confirm Pickup
              </Text>
            </>
          )}
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerRight: { width: 36 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  instructionBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionText: { ...typography.body, color: colors.primaryDark, flex: 1, lineHeight: 22 },
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
  cameraInner: { alignItems: 'center', gap: spacing.sm },
  cameraTitle: { ...typography.h3, color: colors.textSecondary },
  cameraSubtitle: { ...typography.bodySmall, color: colors.textMuted },
  tipsCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.sm,
  },
  tipsTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tipDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.primary, flexShrink: 0 },
  tipText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  buttonRow: { flexDirection: 'row', gap: spacing.md },
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
  actionBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.primary },
  actionBtnSecondary: { backgroundColor: colors.surface, borderColor: colors.border },
  actionBtnSecondaryText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countText: { ...typography.bodySmall, color: colors.textSecondary },
  thumbnailSection: { gap: spacing.sm },
  thumbnailTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  thumbnailStrip: { gap: spacing.md, paddingVertical: spacing.sm },
  thumbnailWrapper: { alignItems: 'center', position: 'relative' },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    ...shadows.small,
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
  footerHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
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
  confirmBtnDisabled: { backgroundColor: colors.border, ...shadows.small },
  confirmBtnText: { ...typography.button, color: colors.textInverse },
  confirmBtnTextDisabled: { color: colors.textMuted },
});
