// ============================================
// MapPickerScreen — Drop a pin to pick location
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

export default function MapPickerScreen({ navigation, route }) {
  const initial = route?.params?.initial; // { latitude, longitude, address } if editing
  const mapRef = useRef(null);

  const [marker,      setMarker]      = useState(
    initial?.latitude ? { latitude: initial.latitude, longitude: initial.longitude } : null
  );
  const [address,     setAddress]     = useState(initial?.address || '');
  const [loading,     setLoading]     = useState(false);
  const [locating,    setLocating]    = useState(false);
  const [searchText,  setSearchText]  = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching,   setSearching]   = useState(false);

  // On mount, if no initial pin — go to user's current location
  useEffect(() => {
    if (!initial?.latitude) goToMyLocation();
  }, []);

  const goToMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocating(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setMarker(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
      await reverseGeocode(coords);
    } catch {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  const reverseGeocode = async (coords) => {
    setLoading(true);
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.name, r.street, r.district, r.city, r.region].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch {
      setAddress(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearching(true);
    Keyboard.dismiss();
    try {
      const results = await Location.geocodeAsync(searchText.trim());
      if (results.length === 0) {
        Alert.alert('Not found', 'No location found for that name. Try a more specific address.');
        return;
      }
      // Show suggestions if multiple results
      if (results.length === 1) {
        await selectSearchResult(results[0]);
      } else {
        // Reverse geocode each to get readable names
        const named = await Promise.all(
          results.slice(0, 5).map(async (r) => {
            const rev = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
            const p = rev[0];
            const label = [p?.name, p?.city, p?.region, p?.country].filter(Boolean).join(', ');
            return { ...r, label };
          })
        );
        setSuggestions(named);
      }
    } catch {
      Alert.alert('Error', 'Search failed. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = async (result) => {
    const coords = { latitude: result.latitude, longitude: result.longitude };
    setMarker(coords);
    setSuggestions([]);
    setSearchText('');
    mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
    await reverseGeocode(coords);
  };

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    await reverseGeocode(coords);
  };

  const handleConfirm = () => {
    if (!marker) { Alert.alert('Pick a location', 'Tap on the map to drop a pin.'); return; }
    const returnTo = route?.params?.returnTo || 'AddListing';
    const { savedPhotos, savedForm, savedFrom, savedTo } = route?.params || {};
    navigation.navigate(returnTo, {
      pickedLocation: { latitude: marker.latitude, longitude: marker.longitude, address },
      savedPhotos,
      savedForm,
      savedFrom,
      savedTo,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick Location</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search place or address..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={(t) => { setSearchText(t); if (!t) setSuggestions([]); }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setSuggestions([]); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          {searching && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 4 }} />}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <FlatList
            data={suggestions}
            keyExtractor={(_, i) => String(i)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => selectSearchResult(item)}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={styles.suggestionText} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Text style={styles.hint}>Tap anywhere on the map to fine-tune the pin</Text>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude:      marker?.latitude  ?? 12.9716,
          longitude:     marker?.longitude ?? 77.5946,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      {/* My location button */}
      <TouchableOpacity style={styles.locateBtn} onPress={goToMyLocation} disabled={locating}>
        {locating
          ? <ActivityIndicator size="small" color={colors.primary} />
          : <Ionicons name="locate" size={22} color={colors.primary} />
        }
      </TouchableOpacity>

      {/* Address preview + confirm */}
      <View style={styles.footer}>
        {marker ? (
          <>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                {loading
                  ? <ActivityIndicator size="small" color={colors.textMuted} />
                  : <Text style={styles.addressText} numberOfLines={2}>{address || 'Fetching address...'}</Text>
                }
                <Text style={styles.coordsText}>
                  {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noPickText}>No location selected yet</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput:   { flex: 1, ...typography.body, color: colors.textPrimary },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { ...typography.bodySmall, fontWeight: '700', color: colors.textInverse },
  suggestions: {
    position: 'absolute',
    top: 130,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 100,
    maxHeight: 220,
    ...shadows.medium,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: { ...typography.bodySmall, color: colors.textPrimary, flex: 1 },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  map:         { flex: 1 },
  locateBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 220,
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    minHeight: 150,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  addressText:  { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  coordsText:   { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.small,
  },
  confirmBtnText: { ...typography.button, color: colors.textInverse },
  noPickText:     { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
