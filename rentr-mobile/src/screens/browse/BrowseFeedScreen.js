// ============================================
// Browse Feed Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const MOCK_ITEMS = [
  { id: '1', title: 'Canon DSLR Camera',     price: 35,  category: 'Cameras',     rating: 4.8, reviews: 24, distance: '1.2 km',  owner: 'Alex M.' },
  { id: '2', title: 'Power Drill Set',        price: 15,  category: 'Tools',       rating: 4.5, reviews: 18, distance: '0.8 km',  owner: 'Sara K.' },
  { id: '3', title: 'Mountain Bike',          price: 25,  category: 'Sports',      rating: 4.9, reviews: 41, distance: '2.1 km',  owner: 'Mike R.' },
  { id: '4', title: 'Camping Tent (4-man)',   price: 20,  category: 'Outdoor',     rating: 4.7, reviews: 15, distance: '3.4 km',  owner: 'Lisa T.' },
  { id: '5', title: 'DJI Mini 3 Drone',       price: 60,  category: 'Cameras',     rating: 4.6, reviews: 32, distance: '1.9 km',  owner: 'Tom B.' },
  { id: '6', title: 'Pressure Washer',        price: 30,  category: 'Tools',       rating: 4.4, reviews: 9,  distance: '4.2 km',  owner: 'Anna S.' },
  { id: '7', title: 'Road Bicycle',           price: 22,  category: 'Sports',      rating: 4.8, reviews: 27, distance: '0.5 km',  owner: 'Chris P.' },
  { id: '8', title: 'Projector + Screen',     price: 40,  category: 'Electronics', rating: 4.9, reviews: 12, distance: '2.7 km',  owner: 'Jane L.' },
];

export default function BrowseFeedScreen({ navigation }) {
  const [searchText,  setSearchText]  = useState('');
  const [savedItems,  setSavedItems]  = useState([]);

  const toggleSave = (id) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = MOCK_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      activeOpacity={0.9}
    >
      {/* Photo */}
      <View style={styles.photo}>
        <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        {/* Save (heart) button */}
        <TouchableOpacity style={styles.heartButton} onPress={() => toggleSave(item.id)}>
          <Ionicons
            name={savedItems.includes(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={savedItems.includes(item.id) ? colors.error : colors.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
          </View>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.price}><Text style={styles.priceAmount}>${item.price}</Text>/day</Text>
          <Text style={styles.owner}>{item.owner}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Items</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SearchFilters', {})} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  headerTitle:   { ...typography.h2, color: colors.textPrimary },
  filterBtn:     { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchWrapper: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  searchBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.lg, height: 48, borderWidth: 1, borderColor: colors.border },
  searchInput:   { flex: 1, ...typography.body, color: colors.textPrimary },
  list:          { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  card:          { backgroundColor: colors.background, borderRadius: radius.xl, overflow: 'hidden', ...shadows.small, borderWidth: 1, borderColor: colors.border },
  photo:         { height: 200, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  categoryBadge: { position: 'absolute', top: spacing.md, left: spacing.md, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: radius.full },
  categoryText:  { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
  heartButton:   { position: 'absolute', top: spacing.md, right: spacing.md, width: 36, height: 36, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  info:          { padding: spacing.lg },
  title:         { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  metaRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText:    { ...typography.caption, color: colors.textSecondary },
  distanceRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText:  { ...typography.caption, color: colors.textMuted },
  bottomRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:         { ...typography.bodySmall, color: colors.textSecondary },
  priceAmount:   { ...typography.h3, color: colors.primary },
  owner:         { ...typography.caption, color: colors.textMuted },
  empty:         { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
  emptyTitle:    { ...typography.h3, color: colors.textSecondary },
  emptySubtitle: { ...typography.body, color: colors.textMuted },
});
