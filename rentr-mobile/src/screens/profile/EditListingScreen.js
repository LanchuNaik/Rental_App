// ============================================
// EditListingScreen — Edit an existing listing
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { updateItemApi } from '../../services/item.service';
import { CATEGORIES } from '../../constants/categories';

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date';

export default function EditListingScreen({ navigation, route }) {
  const { listing } = route.params;

  const [saving,         setSaving]         = useState(false);
  const [availableFrom,  setAvailableFrom]  = useState(listing.availableFrom ? new Date(listing.availableFrom) : null);
  const [availableTo,    setAvailableTo]    = useState(listing.availableTo   ? new Date(listing.availableTo)   : null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker,   setShowToPicker]   = useState(false);
  const [location,       setLocation]       = useState(
    listing.location?.address ? {
      address:   listing.location.address,
      latitude:  listing.location.coordinates?.[1] ?? '',
      longitude: listing.location.coordinates?.[0] ?? '',
    } : null
  );
  const [form, setForm] = useState({
    title:       listing.title       || '',
    category:    listing.category    || '',
    description: listing.description || '',
    price:       listing.pricePerDay ? String(listing.pricePerDay) : '',
  });

  // Receive picked location back from MapPickerScreen
  useEffect(() => {
    if (route?.params?.pickedLocation) {
      setLocation(route.params.pickedLocation);
    }
  }, [route?.params?.pickedLocation]);

  const handleSave = async () => {
    if (!form.title.trim())       { Alert.alert('Required', 'Title is required.'); return; }
    if (!form.description.trim()) { Alert.alert('Required', 'Description is required.'); return; }
    if (!form.price)              { Alert.alert('Required', 'Daily rate is required.'); return; }

    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        category:    form.category.trim() || null,
        availableFrom: availableFrom ? availableFrom.toISOString() : null,
        availableTo:   availableTo   ? availableTo.toISOString()   : null,
      };

      if (location) {
        payload.address   = location.address;
        payload.latitude  = location.latitude;
        payload.longitude = location.longitude;
      }

      await updateItemApi(listing.id, payload);
      Alert.alert('Saved!', 'Your listing has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveHeaderBtn}>
          {saving
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Text style={styles.saveHeaderBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const active = form.category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setForm((f) => ({ ...f, category: active ? '' : cat.id }))}
                  activeOpacity={0.8}
                >
                  <Ionicons name={cat.icon} size={14} color={active ? '#fff' : cat.color} />
                  <Text style={[styles.categoryChipText, active && { color: '#fff' }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Describe condition, what's included..."
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

        {/* Availability */}
        <Text style={styles.sectionTitle}>Availability</Text>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>From</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.dateBtnText, !availableFrom && styles.dateBtnPlaceholder]}>
                {formatDate(availableFrom)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>To</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowToPicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.dateBtnText, !availableTo && styles.dateBtnPlaceholder]}>
                {formatDate(availableTo)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={availableFrom || new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowFromPicker(false);
              if (date) setAvailableFrom(date);
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={availableTo || availableFrom || new Date()}
            mode="date"
            display="default"
            minimumDate={availableFrom || new Date()}
            onChange={(_, date) => {
              setShowToPicker(false);
              if (date) setAvailableTo(date);
            }}
          />
        )}

        {/* Location */}
        <Text style={styles.sectionTitle}>Pickup Location</Text>

        <TouchableOpacity
          style={styles.mapPickerBtn}
          onPress={() => navigation.navigate('MapPicker', {
            initial: location || undefined,
            returnTo: 'EditListing',
          })}
          activeOpacity={0.85}
        >
          <Ionicons name="map-outline" size={22} color={colors.primary} />
          <Text style={styles.mapPickerBtnText}>
            {location ? 'Change Location' : 'Pick on Map'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        {location && (
          <View style={styles.locationPreview}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationAddress}>{location.address}</Text>
              <Text style={styles.locationCoords}>
                {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={colors.textInverse} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background,
  },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { ...typography.h3, color: colors.textPrimary },
  saveHeaderBtn:    { paddingHorizontal: spacing.sm, height: 36, justifyContent: 'center' },
  saveHeaderBtnText:{ ...typography.body, fontWeight: '600', color: colors.primary },
  scrollContent:    { padding: spacing.lg, gap: spacing.md },
  sectionTitle:     { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  fieldGroup:       { gap: spacing.sm },
  categoryGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  categoryChipText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  fieldLabel:       { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.body, color: colors.textPrimary, backgroundColor: colors.surface,
  },
  textArea:         { minHeight: 100, paddingTop: spacing.md },
  charCount:        { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  prefixInputWrapper: { flexDirection: 'row' },
  prefix: {
    width: 44, borderWidth: 1.5, borderRightWidth: 0, borderColor: colors.border,
    borderTopLeftRadius: radius.md, borderBottomLeftRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  prefixText:       { ...typography.body, fontWeight: '700', color: colors.textSecondary },
  prefixInput:      { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  rowFields:        { flexDirection: 'row', gap: spacing.md },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface,
  },
  dateBtnText:        { ...typography.bodySmall, color: colors.textPrimary },
  dateBtnPlaceholder: { color: colors.textMuted },
  mapPickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.primaryLight,
  },
  mapPickerBtnText: { ...typography.body, fontWeight: '600', color: colors.primary, flex: 1 },
  locationPreview: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  locationAddress:  { ...typography.bodySmall, color: colors.textPrimary, lineHeight: 20 },
  locationCoords:   { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginTop: spacing.lg, ...shadows.medium,
  },
  saveBtnText: { ...typography.button, color: colors.textInverse },
});
