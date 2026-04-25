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
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { confirmReturnApi } from '../../services/booking.service';

export default function ReturnConfirmationScreen({ navigation, route }) {
  const { bookingId } = route?.params || {};
  const [returnPhotos,  setReturnPhotos]  = useState([]);
  const [damageNote,    setDamageNote]    = useState('');
  const [noteFocused,   setNoteFocused]   = useState(false);
  const [confirmed,     setConfirmed]     = useState(false);
  const [uploading,     setUploading]     = useState(false);

  const handleTakeReturnPhoto = async () => {
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
      setReturnPhotos((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
  };

  const handlePickFromLibrary = async () => {
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
      setReturnPhotos((prev) => [...prev, ...result.assets.map((a) => ({ uri: a.uri }))]);
    }
  };

  const handleConfirmReturn = () => {
    if (returnPhotos.length === 0) {
      Alert.alert('Photos Required', 'Please take at least one photo of the returned item.');
      return;
    }
    Alert.alert(
      'Confirm Return',
      'This will mark the item as returned and release payment to your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (!bookingId) {
              Alert.alert('Error', 'Booking ID is missing.');
              return;
            }
            setUploading(true);
            try {
              await confirmReturnApi(bookingId, returnPhotos.map((p) => p.uri));
              setConfirmed(true);
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not confirm return. Please try again.');
            } finally {
              setUploading(false);
            }
          },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Return</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.instructionBanner}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.instructionText}>
            Take return condition photos and confirm the item has been returned safely.
          </Text>
        </View>

        {/* Take Return Photos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Return Condition Photos</Text>
          <View style={styles.photoButtonRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakeReturnPhoto} activeOpacity={0.85}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, styles.photoBtnSecondary]} onPress={handlePickFromLibrary} activeOpacity={0.85}>
              <Ionicons name="images-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.photoBtnSecondaryText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {returnPhotos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
              {returnPhotos.map((p, idx) => (
                <View key={idx} style={styles.returnThumbWrapper}>
                  <Image source={{ uri: p.uri }} style={styles.returnThumb} />
                  <TouchableOpacity
                    style={styles.removeThumbBtn}
                    onPress={() => setReturnPhotos((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {returnPhotos.length === 0 && (
            <Text style={styles.noPhotosHint}>No return photos yet — tap above to add</Text>
          )}
        </View>

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

        <View style={styles.paymentInfoCard}>
          <Ionicons name="wallet-outline" size={20} color={colors.success} />
          <View style={styles.paymentInfoText}>
            <Text style={styles.paymentInfoTitle}>Payment Release</Text>
            <Text style={styles.paymentInfoBody}>
              Confirming return will release your earnings to your account within 2-3 business days.
            </Text>
          </View>
        </View>

        <View style={{ height: spacing.xxxl + spacing.xl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmReturn}
          activeOpacity={0.85}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
              <Text style={styles.confirmBtnText}>Confirm Return & Release Payment</Text>
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
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerRight:{ width: 36 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  instructionBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionText: { ...typography.bodySmall, color: colors.primaryDark, flex: 1, lineHeight: 20 },
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
  photoButtonRow: { flexDirection: 'row', gap: spacing.md },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  photoBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.primary },
  photoBtnSecondary: { backgroundColor: colors.surface, borderColor: colors.border },
  photoBtnSecondaryText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  photoStrip: { gap: spacing.sm, paddingVertical: spacing.xs },
  returnThumbWrapper: { position: 'relative' },
  returnThumb: { width: 80, height: 80, borderRadius: radius.md },
  removeThumbBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.background,
    borderRadius: radius.full,
  },
  noPhotosHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
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
  noteInputFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  paymentInfoCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  paymentInfoText: { flex: 1, gap: spacing.xs },
  paymentInfoTitle: { ...typography.bodySmall, fontWeight: '700', color: '#065F46' },
  paymentInfoBody: { ...typography.bodySmall, color: '#047857', lineHeight: 20 },
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
  confirmBtnText: { ...typography.button, color: colors.textInverse },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  successIconWrapper: { marginBottom: spacing.md },
  successTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
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
  successCardText: { flex: 1, gap: spacing.xs },
  successCardTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.primaryDark },
  successCardBody: { ...typography.bodySmall, color: colors.primary, lineHeight: 20 },
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
  doneBtnText: { ...typography.button, color: colors.textInverse },
});
