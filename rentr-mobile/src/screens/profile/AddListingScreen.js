// ============================================
// AddListingScreen — Single page listing form
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { createItemApi } from '../../services/item.service';

const formatDate = (date) =>
  date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date';

export default function AddListingScreen({ navigation, route }) {
  const [publishing,     setPublishing]     = useState(false);
  const [photos,         setPhotos]         = useState(Array(5).fill(null));
  const [availableFrom,  setAvailableFrom]  = useState(null);
  const [availableTo,    setAvailableTo]    = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker,   setShowToPicker]   = useState(false);
  const [location, setLocation] = useState(null); // { latitude, longitude, address }
  const [form, setForm] = useState({
    title:       '',
    category:    '',
    description: '',
    price:       '',
  });

  // Receive picked location from MapPickerScreen
  useEffect(() => {
    if (route?.params?.pickedLocation) {
      setLocation(route.params.pickedLocation);
    }
  }, [route?.params?.pickedLocation]);

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
    if (!location)                { Alert.alert('Required', 'Please pick a location on the map.'); return; }

    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('title',       form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('price',       form.price);
      if (form.category.trim())  formData.append('category',      form.category.trim());
      formData.append('address',     location.address);
      formData.append('latitude',    String(location.latitude));
      formData.append('longitude',   String(location.longitude));
      if (availableFrom)         formData.append('availableFrom', availableFrom.toISOString());
      if (availableTo)           formData.append('availableTo',   availableTo.toISOString());

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

        <TouchableOpacity
          style={styles.mapPickerBtn}
          onPress={() => navigation.navigate('MapPicker', {
            initial: location ? location : undefined,
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
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        )}

        {/* Availability */}
        <Text style={styles.sectionTitle}>Availability</Text>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Available From</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.dateBtnText, !availableFrom && styles.dateBtnPlaceholder]}>
                {formatDate(availableFrom)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Available To</Text>
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
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  dateBtnText:        { ...typography.bodySmall, color: colors.textPrimary },
  dateBtnPlaceholder: { color: colors.textMuted },
  mapPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  mapPickerBtnText: { ...typography.body, fontWeight: '600', color: colors.primary, flex: 1 },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationAddress: { ...typography.bodySmall, color: colors.textPrimary, lineHeight: 20 },
  locationCoords:  { ...typography.caption, color: colors.textMuted, marginTop: 2 },
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
