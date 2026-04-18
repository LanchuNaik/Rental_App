// ============================================
// AddListingScreen — Single page listing form
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { createItemApi } from '../../services/item.service';

export default function AddListingScreen({ navigation }) {
  const [publishing, setPublishing] = useState(false);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  const [form, setForm] = useState({
    title:       '',
    category:    '',
    description: '',
    price:       '',
    address:     '',
    latitude:    '',
    longitude:   '',
  });

  const pickPhoto = async (idx) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const updated = [...photos];
      updated[idx] = result.assets[0].uri;
      setPhotos(updated);
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim())       { Alert.alert('Required', 'Please enter an item title.'); return; }
    if (!form.description.trim()) { Alert.alert('Required', 'Please enter a description.'); return; }
    if (!form.price)              { Alert.alert('Required', 'Please enter a daily rate.'); return; }
    if (!form.address.trim())     { Alert.alert('Required', 'Please enter a pickup address.'); return; }

    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('title',       form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('price',       form.price);
      if (form.category.trim()) formData.append('category',  form.category.trim());
      if (form.address.trim())  formData.append('address',   form.address.trim());
      if (form.latitude)        formData.append('latitude',  form.latitude);
      if (form.longitude)       formData.append('longitude', form.longitude);

      photos.filter(Boolean).forEach((uri) => {
        formData.append('images', { uri, name: `item_${Date.now()}.jpg`, type: 'image/jpeg' });
      });

      await createItemApi(formData);
      Alert.alert('Published!', 'Your listing is now live.', [
        { text: 'OK', onPress: () => navigation.navigate('MyListings') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to publish listing');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Photos */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSubtitle}>Add up to 5 photos. First photo is the cover.</Text>
        <View style={styles.photoGrid}>
          {photos.map((photo, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.photoBox, photo && styles.photoBoxFilled]}
              onPress={() => pickPhoto(idx)}
              activeOpacity={0.8}
            >
              {photo ? (
                <>
                  <Ionicons name="image" size={28} color={colors.primary} />
                  {idx === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Ionicons name="add" size={28} color={colors.textMuted} />
                  {idx === 0 && <Text style={styles.addPhotoLabel}>Cover</Text>}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Details */}
        <Text style={styles.sectionTitle}>Item Details</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            placeholder="e.g. Canon DSLR Camera"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <TextInput
            style={styles.input}
            value={form.category}
            onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
            placeholder="e.g. Electronics, Tools, Sports"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Describe condition, what's included, any rules..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{form.description.length}/500</Text>
        </View>

        {/* Price */}
        <Text style={styles.sectionTitle}>Price</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Daily Rate (₹) *</Text>
          <View style={styles.prefixInputWrapper}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>₹</Text>
            </View>
            <TextInput
              style={[styles.input, styles.prefixInput]}
              value={form.price}
              onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>Pickup Location</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Address *</Text>
          <TextInput
            style={styles.input}
            value={form.address}
            onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
            placeholder="e.g. Jigani APC Circle, Bangalore"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={form.latitude}
              onChangeText={(v) => setForm((f) => ({ ...f, latitude: v }))}
              placeholder="12.9716"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={form.longitude}
              onChangeText={(v) => setForm((f) => ({ ...f, longitude: v }))}
              placeholder="77.5946"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Finding coordinates</Text>
          <Text style={styles.tipsBody}>Open Google Maps → long-press your location → copy the numbers shown at the top.</Text>
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={handlePublish}
          activeOpacity={0.85}
          disabled={publishing}
        >
          {publishing ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={colors.textInverse} />
              <Text style={styles.publishBtnText}>Publish Listing</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
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
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: { ...typography.bodySmall, color: colors.textSecondary },
  // Photos
  photoGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  photoBox: {
    width: '28%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    position: 'relative',
    gap: 4,
  },
  photoBoxFilled:  { borderColor: colors.primary, borderStyle: 'solid', backgroundColor: colors.primaryLight },
  coverBadge:      { position: 'absolute', bottom: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  coverBadgeText:  { ...typography.caption, fontWeight: '700', color: colors.textInverse, fontSize: 10 },
  addPhotoLabel:   { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  // Form
  fieldGroup:  { gap: spacing.sm },
  fieldLabel:  { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  textArea:    { minHeight: 100, paddingTop: spacing.md },
  charCount:   { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  prefixInputWrapper: { flexDirection: 'row' },
  prefix: {
    width: 44,
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText:  { ...typography.body, fontWeight: '700', color: colors.textSecondary },
  prefixInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  rowFields:   { flexDirection: 'row', gap: spacing.md },
  tipsBox:     { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  tipsTitle:   { ...typography.bodySmall, fontWeight: '700', color: colors.primaryDark },
  tipsBody:    { ...typography.bodySmall, color: colors.primary, lineHeight: 20 },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  publishBtnText: { ...typography.button, color: colors.textInverse },
});
