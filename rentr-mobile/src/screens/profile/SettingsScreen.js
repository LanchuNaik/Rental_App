// ============================================
// SettingsScreen — App settings grouped list
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ToggleRow({ icon, iconColor, iconBg, label, value, onValueChange, isLast }) {
  return (
    <View style={[styles.settingRow, !isLast && styles.settingRowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : colors.textMuted}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

function LinkRow({ icon, iconColor, iconBg, label, onPress, isLast, labelColor }) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, !isLast && styles.settingRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, labelColor && { color: labelColor }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data, listings, and bookings will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={styles.group}>
          <ToggleRow
            icon="notifications-outline"
            iconColor={colors.primary}
            iconBg={colors.primaryLight}
            label="Push Notifications"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <ToggleRow
            icon="mail-outline"
            iconColor={colors.info}
            iconBg="#EFF6FF"
            label="Email Notifications"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            isLast
          />
        </View>

        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <View style={styles.group}>
          <ToggleRow
            icon="moon-outline"
            iconColor="#6D28D9"
            iconBg="#EDE9FE"
            label="Dark Mode"
            value={darkMode}
            onValueChange={(v) => {
              setDarkMode(v);
              Alert.alert('Dark Mode', 'Dark mode UI is coming soon!');
            }}
            isLast
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.group}>
          <LinkRow
            icon="key-outline"
            iconColor={colors.warning}
            iconBg="#FEF3C7"
            label="Change Password"
            onPress={() => {}}
          />
          <LinkRow
            icon="link-outline"
            iconColor={colors.info}
            iconBg="#EFF6FF"
            label="Linked Accounts"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* Legal Section */}
        <SectionHeader title="Legal" />
        <View style={styles.group}>
          <LinkRow
            icon="shield-outline"
            iconColor={colors.textSecondary}
            iconBg={colors.surface}
            label="Privacy Policy"
            onPress={() => {}}
          />
          <LinkRow
            icon="document-text-outline"
            iconColor={colors.textSecondary}
            iconBg={colors.surface}
            label="Terms of Service"
            onPress={() => {}}
          />
          <LinkRow
            icon="code-slash-outline"
            iconColor={colors.textSecondary}
            iconBg={colors.surface}
            label="Licenses"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Rentr v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with care in San Francisco</Text>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </View>
          <Text style={styles.deleteLabel}>Delete Account</Text>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  group: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  appInfoText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
    flex: 1,
  },
});
