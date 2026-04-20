// ============================================
// Search / Filters Screen
// ============================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { CATEGORY_LABELS } from '../../constants/categories';

const CATEGORIES = ['All', ...CATEGORY_LABELS];
const SORT_OPTIONS = ['Default', 'Price: low to high', 'Price: high to low'];

const SORT_MAP = {
  'Default':             null,
  'Price: low to high':  'price',
  'Price: high to low':  '-price',
};

export default function SearchFiltersScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort,     setSelectedSort]     = useState('Default');
  const [minPrice,         setMinPrice]         = useState('');
  const [maxPrice,         setMaxPrice]         = useState('');

  // Sync state whenever activeFilters param changes (covers returning to screen)
  useEffect(() => {
    const f = route?.params?.activeFilters || {};
    setSelectedCategory(f.category  || 'All');
    setSelectedSort(f.sortLabel     || 'Default');
    setMinPrice(f.minPrice > 0      ? String(f.minPrice) : '');
    setMaxPrice(f.maxPrice          ? String(f.maxPrice) : '');
  }, [route?.params?.activeFilters]);

  const handleApply = () => {
    navigation.navigate('BrowseFeed', {
      filters: {
        category:  selectedCategory,
        minPrice:  minPrice  ? Number(minPrice)  : 0,
        maxPrice:  maxPrice  ? Number(maxPrice)  : null,
        sort:      SORT_MAP[selectedSort],
        sortLabel: selectedSort,
      },
    });
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedSort('Default');
    setMinPrice('');
    setMaxPrice('');
  };

  const SectionTitle = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Category */}
        <SectionTitle title="Category" />
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price range */}
        <SectionTitle title="Price range (per day)" />
        <View style={styles.priceRow}>
          <View style={styles.priceInputBox}>
            <Text style={styles.priceLabel}>Min (₹)</Text>
            <TextInput
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.priceDash} />
          <View style={styles.priceInputBox}>
            <Text style={styles.priceLabel}>Max (₹)</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Any"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Sort */}
        <SectionTitle title="Sort by" />
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={styles.sortRow}
            onPress={() => setSelectedSort(opt)}
          >
            <Text style={[styles.sortText, selectedSort === opt && styles.sortTextActive]}>{opt}</Text>
            {selectedSort === opt && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Apply button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton:      { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { ...typography.h3, color: colors.textPrimary },
  resetText:       { ...typography.body, color: colors.primary, fontWeight: '600' },
  content:         { padding: spacing.xl, paddingBottom: 100 },
  sectionTitle:    { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl },
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip:            { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  chipActive:      { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:        { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  chipTextActive:  { color: colors.textInverse },
  priceRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  priceInputBox:   { flex: 1, gap: spacing.sm },
  priceLabel:      { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  priceInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    ...typography.body, color: colors.textPrimary, backgroundColor: colors.surface,
  },
  priceDash:       { width: 12, height: 2, backgroundColor: colors.border, marginTop: spacing.xl },
  sortRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sortText:        { ...typography.body, color: colors.textSecondary },
  sortTextActive:  { color: colors.primary, fontWeight: '600' },
  footer:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  applyButton:     { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  applyButtonText: { ...typography.button, color: colors.textInverse },
});
