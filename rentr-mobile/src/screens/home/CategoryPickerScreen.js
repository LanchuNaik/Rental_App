// ============================================
// Category Picker Screen
// ============================================

import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { CATEGORIES } from '../../constants/categories';

export default function CategoryPickerScreen({ navigation }) {
  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse by Category</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() => navigation.navigate('BrowseStack', { screen: 'BrowseFeed', params: { category: cat.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon} size={32} color={cat.color} />
            </View>
            <Text style={styles.label}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  backButton:   { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { ...typography.h3, color: colors.textPrimary },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card:         { width: '47%', backgroundColor: colors.background, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', ...shadows.small, borderWidth: 1, borderColor: colors.border },
  iconCircle:   { width: 64, height: 64, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  label:        { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
});
