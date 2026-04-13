// ============================================
// ProfileHomeScreen — Profile tab root screen
// ============================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const MOCK_USER = {
  name: 'Jamie Doe',
  initials: 'JD',
  rating: 4.8,
  reviewCount: 23,
  listings: 5,
  rentals: 18,
  memberSince: '2024',
};

const MENU_ITEMS = [
  { label: 'My Listings', icon: 'grid-outline', route: 'MyListings', color: colors.primary },
  { label: 'Saved Items', icon: 'heart-outline', route: 'SavedItems', color: '#EF4444' },
  { label: 'Earnings', icon: 'wallet-outline', route: 'Earnings', color: colors.success },
  { label: 'Notifications', icon: 'notifications-outline', route: 'Notifications', color: colors.info },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings', color: colors.textSecondary },
  { label: 'Help & Support', icon: 'help-circle-outline', route: 'HelpSupport', color: colors.warning },
];

function StarRow({ rating, reviewCount }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= fullStars ? 'star' : hasHalf && s === fullStars + 1 ? 'star-half' : 'star-outline'}
          size={14}
          color="#F59E0B"
        />
      ))}
      <Text style={styles.reviewCount}>{rating} ({reviewCount} reviews)</Text>
    </View>
  );
}

export default function ProfileHomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cover Image + Avatar */}
        <View style={styles.coverArea}>
          {/* Teal gradient cover via layered Views */}
          <View style={styles.coverGradientBase} />
          <View style={styles.coverGradientOverlay} />

          {/* Edit profile button */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={16} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Avatar overlapping cover */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{MOCK_USER.initials}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <StarRow rating={MOCK_USER.rating} reviewCount={MOCK_USER.reviewCount} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.listings}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.rentals}</Text>
              <Text style={styles.statLabel}>Rentals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.memberSince}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* Stripe Connect Banner */}
        <TouchableOpacity
          style={styles.stripeBanner}
          onPress={() => navigation.navigate('StripeConnect')}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={20} color={colors.primary} />
          <Text style={styles.stripeBannerText}>Set up payouts — Connect with Stripe</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuRow,
                idx < MENU_ITEMS.length - 1 && styles.menuRowBorder,
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrapper, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.menuIconWrapper, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </View>
          <Text style={styles.logoutLabel}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  coverArea: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  coverGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  coverGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDark,
    opacity: 0.4,
  },
  editProfileBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -44,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
    ...shadows.medium,
  },
  avatarInitials: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    width: '100%',
    ...shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  stripeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stripeBannerText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  menuSection: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.small,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
  },
  logoutLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
    flex: 1,
  },
});
