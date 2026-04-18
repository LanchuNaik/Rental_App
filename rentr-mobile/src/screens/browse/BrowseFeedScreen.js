// ============================================
// Browse Feed Screen
// ============================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getItemsApi, saveItemApi, unsaveItemApi } from '../../services/item.service';

export default function BrowseFeedScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [items,      setItems]      = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getItemsApi();
        setItems(res.data);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const toggleSave = async (id) => {
    const alreadySaved = savedItems.includes(id);
    setSavedItems((prev) =>
      alreadySaved ? prev.filter((x) => x !== id) : [...prev, id]
    );
    try {
      if (alreadySaved) await unsaveItemApi(id);
      else await saveItemApi(id);
    } catch (err) {
      // revert on failure
      setSavedItems((prev) =>
        alreadySaved ? [...prev, id] : prev.filter((x) => x !== id)
      );
    }
  };

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item._id })}
      activeOpacity={0.9}
    >
      {/* Photo */}
      <View style={styles.photo}>
        <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        {item.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.heartButton} onPress={() => toggleSave(item._id)}>
          <Ionicons
            name={savedItems.includes(item._id) ? 'heart' : 'heart-outline'}
            size={20}
            color={savedItems.includes(item._id) ? colors.error : colors.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.avgRating ?? '—'}</Text>
          </View>
          {item.location?.address ? (
            <View style={styles.distanceRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.distanceText}>{item.location.address}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.price}><Text style={styles.priceAmount}>₹{item.price}</Text>/day</Text>
          <Text style={styles.owner}>{item.owner?.name || ''}</Text>
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
      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} size="large" color={colors.primary} />
      ) : <FlatList
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
      />}
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
