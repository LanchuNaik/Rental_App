// ============================================
// Map Home Screen
// ============================================
// Full-screen map with item pins, search bar,
// category filter chips, and a bottom sheet
// showing nearby items as a scrollable list.
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, Dimensions, Image,
} from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getNearbyItemsApi } from '../../services/item.service';
import { CATEGORY_LABELS } from '../../constants/categories';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CATEGORIES = ['All', ...CATEGORY_LABELS];

// Default region (San Francisco) until location is granted
const DEFAULT_REGION = {
  latitude:       37.7749,
  longitude:      -122.4194,
  latitudeDelta:  0.02,
  longitudeDelta: 0.02,
};

export default function MapHomeScreen({ navigation }) {
  const [location,         setLocation]         = useState(null);
  const [items,            setItems]            = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText,       setSearchText]       = useState('');
  const mapRef = useRef(null);

  // Fetch nearby items when we have user location
  const fetchNearby = useCallback(async (lat, lng) => {
    try {
      const res = await getNearbyItemsApi(lat, lng, 10);
      setItems(res.data?.items || res.data || []);
    } catch {
      // silently keep empty items on error
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Still show default region items
        fetchNearby(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      mapRef.current?.animateToRegion({
        latitude:       loc.coords.latitude,
        longitude:      loc.coords.longitude,
        latitudeDelta:  0.02,
        longitudeDelta: 0.02,
      }, 1000);
      fetchNearby(loc.coords.latitude, loc.coords.longitude);
    })();
  }, [fetchNearby]);

  const filteredItems = items.filter((item) =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    (searchText === '' || item.title.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Blue radius circle around user */}
        {location && (
          <Circle
            center={{ latitude: location.latitude, longitude: location.longitude }}
            radius={1500}
            fillColor="rgba(15,118,110,0.06)"
            strokeColor="rgba(15,118,110,0.3)"
            strokeWidth={1}
          />
        )}

        {/* Item price pins */}
        {filteredItems.map((item) => {
          const lat = item.location?.coordinates?.[1] ?? item.lat;
          const lng = item.location?.coordinates?.[0] ?? item.lng;
          if (!lat || !lng) return null;
          return (
            <Marker
              key={item._id || item.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() =>
                navigation.navigate('Browse', {
                  screen: 'ItemDetail',
                  params: { itemId: item._id || item.id },
                })
              }
            >
              <View style={styles.pin}>
                <Text style={styles.pinText}>₹{item.price}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Search bar — floating on top of map */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search nearby items..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Browse', { screen: 'SearchFilters' })}>
          <Ionicons name="options" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} nearby
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsScroll}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyNearby}>
              <Text style={styles.emptyNearbyText}>No items found nearby</Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <TouchableOpacity
                key={item._id || item.id}
                style={styles.itemCard}
                onPress={() =>
                  navigation.navigate('Browse', {
                    screen: 'ItemDetail',
                    params: { itemId: item._id || item.id },
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.itemPhoto}>
                  {item.images?.[0] ? (
                    <Image
                      source={{ uri: `${BASE_URL}/${item.images[0]}` }}
                      style={styles.itemPhotoImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemPrice}>₹{item.price}/day</Text>
                    {item.rating ? (
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Re-center button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={() => {
          if (location) {
            mapRef.current?.animateToRegion({
              latitude:       location.latitude,
              longitude:      location.longitude,
              latitudeDelta:  0.02,
              longitudeDelta: 0.02,
            }, 800);
          }
        }}
      >
        <Ionicons name="locate" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  map:           { flex: 1 },
  searchContainer: { position: 'absolute', top: 52, left: spacing.lg, right: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  searchBar:     { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.lg, paddingHorizontal: spacing.lg, height: 48, ...shadows.medium },
  searchInput:   { flex: 1, ...typography.body, color: colors.textPrimary },
  filterButton:  { width: 48, height: 48, backgroundColor: colors.background, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  chipsWrapper:  { position: 'absolute', top: 112, left: 0, right: 0 },
  chipsScroll:   { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip:          { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.background, borderRadius: radius.full, ...shadows.small },
  chipActive:    { backgroundColor: colors.primary },
  chipText:      { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  chipTextActive:{ color: colors.textInverse },
  bottomSheet:   { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, ...shadows.large },
  sheetHandle:   { width: 36, height: 4, backgroundColor: colors.border, borderRadius: radius.full, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle:    { ...typography.h3, color: colors.textPrimary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  itemsScroll:   { paddingHorizontal: spacing.lg, gap: spacing.md },
  emptyNearby:   { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyNearbyText: { ...typography.bodySmall, color: colors.textMuted },
  itemCard:      { width: 160, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.small },
  itemPhoto:     { height: 110, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemPhotoImg:  { width: '100%', height: '100%' },
  itemInfo:      { padding: spacing.md },
  itemTitle:     { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  itemMeta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice:     { ...typography.caption, color: colors.primary, fontWeight: '700' },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText:    { ...typography.caption, color: colors.textSecondary },
  pin:           { backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.md, ...shadows.small },
  pinText:       { ...typography.caption, fontWeight: '700', color: colors.textInverse },
  recenterButton:{ position: 'absolute', right: spacing.xl, bottom: 220, width: 48, height: 48, backgroundColor: colors.background, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
});
