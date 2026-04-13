// ============================================
// NotificationsScreen — In-app notification history
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const NOTIFICATION_CONFIG = {
  booking_accepted: {
    icon: 'checkmark-circle',
    color: colors.success,
    bg: '#D1FAE5',
  },
  new_message: {
    icon: 'chatbubble',
    color: colors.primary,
    bg: colors.primaryLight,
  },
  payment_received: {
    icon: 'wallet',
    color: colors.success,
    bg: '#D1FAE5',
  },
  return_reminder: {
    icon: 'alarm',
    color: colors.warning,
    bg: '#FEF3C7',
  },
  booking_request: {
    icon: 'calendar',
    color: colors.info,
    bg: '#EFF6FF',
  },
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'booking_accepted',
    title: 'Booking Accepted!',
    body: 'Alex Rivera accepted your request for Sony A7 III Camera. Pickup on Apr 15.',
    timestamp: '2 min ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'new_message',
    title: 'New Message from Alex',
    body: 'Hi! Just confirming your pickup is scheduled for April 15th at 10am...',
    timestamp: '15 min ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'payment_received',
    title: 'Payment Received',
    body: '$120.00 has been released to your Rentr wallet for the Trek Mountain Bike rental.',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: 'n4',
    type: 'return_reminder',
    title: 'Return Reminder',
    body: 'Your rental of DJI Mini 3 Drone is due for return tomorrow by 5:00 PM.',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'booking_request',
    title: 'New Booking Request',
    body: 'Priya Sharma wants to rent your Camping Tent for Apr 22 – Apr 25.',
    timestamp: '2 days ago',
    isRead: true,
  },
];

function NotificationRow({ notification, onPress, onMarkRead }) {
  const cfg = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.new_message;
  return (
    <TouchableOpacity
      style={[styles.notifRow, !notification.isRead && styles.notifRowUnread]}
      onPress={() => {
        onMarkRead(notification.id);
        onPress(notification);
      }}
      activeOpacity={0.75}
    >
      {/* Icon */}
      <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, !notification.isRead && styles.notifTitleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notifTimestamp}>{notification.timestamp}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{notification.body}</Text>
      </View>

      {/* Unread dot */}
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotifPress = (notification) => {
    switch (notification.type) {
      case 'booking_accepted':
      case 'return_reminder':
      case 'booking_request':
        navigation.navigate('BookingDetail', { bookingId: notification.id });
        break;
      case 'new_message':
        navigation.navigate('Chat');
        break;
      case 'payment_received':
        navigation.navigate('Earnings');
        break;
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up! Check back later.</Text>
          </View>
        ) : (
          <>
            {/* Unread Section */}
            {notifications.some((n) => !n.isRead) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>New</Text>
                <View style={styles.notifGroup}>
                  {notifications
                    .filter((n) => !n.isRead)
                    .map((notif, idx, arr) => (
                      <View key={notif.id}>
                        <NotificationRow
                          notification={notif}
                          onPress={handleNotifPress}
                          onMarkRead={markAsRead}
                        />
                        {idx < arr.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Read Section */}
            {notifications.some((n) => n.isRead) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Earlier</Text>
                <View style={styles.notifGroup}>
                  {notifications
                    .filter((n) => n.isRead)
                    .map((notif, idx, arr) => (
                      <View key={notif.id}>
                        <NotificationRow
                          notification={notif}
                          onPress={handleNotifPress}
                          onMarkRead={markAsRead}
                        />
                        {idx < arr.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))}
                </View>
              </View>
            )}
          </>
        )}
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  unreadCountBadge: {
    backgroundColor: colors.info,
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadCountText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
  },
  markAllBtn: {
    paddingHorizontal: spacing.xs,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  markAllText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  headerRight: {
    width: 80,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifGroup: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    ...shadows.small,
    overflow: 'hidden',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
    position: 'relative',
  },
  notifRowUnread: {
    backgroundColor: `${colors.info}08`,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: spacing.xs,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  notifTitle: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifTimestamp: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 0,
  },
  notifBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.info,
    marginTop: spacing.xs,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 44 + spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
