// ============================================
// Map Home Screen
// ============================================
// Full-screen map with item pins, search bar,
// category filter chips, and a bottom sheet
// showing nearby items as a scrollable list.
// ============================================

import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Mock nearby items — replace with real API later
const MOCK_ITEMS = [
  { id: '1', title: 'Canon DSLR Camera', price: 35,  lat: 37.7749, lng: -122.4194, category: 'Cameras',  rating: 4.8 },
  { id: '2', title: 'Power Drill Set',   price: 15,  lat: 37.7759, lng: -122.4180, category: 'Tools',    rating: 4.5 },
  { id: '3', title: 'Mountain Bike',     price: 25,  lat: 37.7739, lng: -122.4210, category: 'Sports',   rating: 4.9 },
  { id: '4', title: 'Camping Tent',      price: 20,  lat: 37.7769, lng: -122.4170, category: 'Outdoor',  rating: 4.7 },
  { id: '5', title: 'DJI Drone',         price: 60,  lat: 37.7729, lng: -122.4220, category: 'Cameras',  rating: 4.6 },
];

const CATEGORIES = ['All', 'Tools', 'Cameras', 'Sports', 'Vehicles', 'Outdoor', 'Electronics'];

export default function MapHomeScreen({ navigation }) {
  const [location,         setLocation]         = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText,       setSearchText]       = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      mapRef.current?.animateToRegion({
        latitude:       loc.coords.latitude,
        longitude:      loc.coords.longitude,
        latitudeDelta:  0.02,
        longitudeDelta: 0.02,
      }, 1000);
    })();
  }, []);

  const filteredItems = MOCK_ITEMS.filter((item) =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    (searchText === '' || item.title.toLowerCase().includes(searchText.toLowerCase()))
  );

  const initialRegion = {
    latitude:       37.7749,
    longitude:      -122.4194,
    latitudeDelta:  0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
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
        {filteredItems.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.lat, longitude: item.lng }}
            onPress={() => navigation.navigate('BrowseStack', { screen: 'ItemDetail', params: { itemId: item.id } })}
          >
            <View style={styles.pin}>
              <Text style={styles.pinText}>${item.price}</Text>
            </View>
          </Marker>
        ))}
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

        {/* Filter button */}
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('SearchFilters')}>
          <Ionicons name="options" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category chips — horizontal scroll */}
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

      {/* Bottom sheet — nearby items list */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {filteredItems.length} items nearby
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsScroll}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => navigation.navigate('BrowseStack', { screen: 'ItemDetail', params: { itemId: item.id } })}
              activeOpacity={0.85}
            >
              {/* Photo placeholder */}
              <View style={styles.itemPhoto}>
                <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemPrice}>${item.price}/day</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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

  // Search bar
  searchContainer: { position: 'absolute', top: 52, left: spacing.lg, right: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  searchBar:     { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.lg, paddingHorizontal: spacing.lg, height: 48, ...shadows.medium },
  searchInput:   { flex: 1, ...typography.body, color: colors.textPrimary },
  filterButton:  { width: 48, height: 48, backgroundColor: colors.background, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },

  // Category chips
  chipsWrapper:  { position: 'absolute', top: 112, left: 0, right: 0 },
  chipsScroll:   { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip:          { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.background, borderRadius: radius.full, ...shadows.small },
  chipActive:    { backgroundColor: colors.primary },
  chipText:      { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  chipTextActive:{ color: colors.textInverse },

  // Bottom sheet
  bottomSheet:   { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, ...shadows.large },
  sheetHandle:   { width: 36, height: 4, backgroundColor: colors.border, borderRadius: radius.full, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle:    { ...typography.h3, color: colors.textPrimary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  itemsScroll:   { paddingHorizontal: spacing.lg, gap: spacing.md },

  // Item card (horizontal)
  itemCard:      { width: 160, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.small },
  itemPhoto:     { height: 110, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  itemInfo:      { padding: spacing.md },
  itemTitle:     { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  itemMeta:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice:     { ...typography.caption, color: colors.primary, fontWeight: '700' },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText:    { ...typography.caption, color: colors.textSecondary },

  // Price pin on map
  pin:           { backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.md, ...shadows.small },
  pinText:       { ...typography.caption, fontWeight: '700', color: colors.textInverse },

  // Re-center FAB
  recenterButton:{ position: 'absolute', right: spacing.xl, bottom: 220, width: 48, height: 48, backgroundColor: colors.background, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
});
