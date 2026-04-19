// ============================================
// Search / Filters Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const CATEGORIES = ['All', 'Tools', 'Cameras', 'Sports', 'Vehicles', 'Outdoor', 'Electronics'];
const SORT_OPTIONS = ['Nearest first', 'Price: low to high', 'Price: high to low', 'Top rated'];
const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

export default function SearchFiltersScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort,     setSelectedSort]     = useState('Nearest first');
  const [selectedRadius,   setSelectedRadius]   = useState(10);
  const [minPrice,         setMinPrice]         = useState(0);
  const [maxPrice,         setMaxPrice]         = useState(200);

  const handleApply = () => {
    // TODO: pass filters back via navigation params or global state
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedSort('Nearest first');
    setSelectedRadius(10);
    setMinPrice(0);
    setMaxPrice(200);
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

        {/* Radius */}
        <SectionTitle title="Distance radius" />
        <View style={styles.chipRow}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, selectedRadius === r && styles.chipActive]}
              onPress={() => setSelectedRadius(r)}
            >
              <Text style={[styles.chipText, selectedRadius === r && styles.chipTextActive]}>{r} km</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price range — simple low/high picker */}
        <SectionTitle title="Price range (per day)" />
        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Min</Text>
            <Text style={styles.priceValue}>₹{minPrice}</Text>
            <View style={styles.priceStepper}>
              <TouchableOpacity onPress={() => setMinPrice(Math.max(0, minPrice - 5))} style={styles.stepBtn}>
                <Ionicons name="remove" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMinPrice(Math.min(maxPrice - 5, minPrice + 5))} style={styles.stepBtn}>
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.priceDash} />
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Max</Text>
            <Text style={styles.priceValue}>₹{maxPrice}</Text>
            <View style={styles.priceStepper}>
              <TouchableOpacity onPress={() => setMaxPrice(Math.max(minPrice + 5, maxPrice - 5))} style={styles.stepBtn}>
                <Ionicons name="remove" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMaxPrice(Math.min(500, maxPrice + 5))} style={styles.stepBtn}>
                <Ionicons name="add" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
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
  priceRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  priceBox:        { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  priceLabel:      { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  priceValue:      { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  priceStepper:    { flexDirection: 'row', gap: spacing.sm },
  stepBtn:         { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  priceDash:       { width: 16, height: 2, backgroundColor: colors.border },
  sortRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sortText:        { ...typography.body, color: colors.textSecondary },
  sortTextActive:  { color: colors.primary, fontWeight: '600' },
  footer:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  applyButton:     { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  applyButtonText: { ...typography.button, color: colors.textInverse },
});
