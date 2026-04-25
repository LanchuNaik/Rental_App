// ============================================
// Booking Request Screen
// ============================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ScrollView, TextInput, StatusBar, ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getItemByIdApi } from '../../services/item.service';

// Combine "YYYY-MM-DD" + a Date carrying H:M into an ISO datetime string
function combineDateTime(dateStr, timeDate) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const out = new Date(y, m - 1, d, timeDate.getHours(), timeDate.getMinutes(), 0, 0);
  return out.toISOString();
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function BookingRequestScreen({ navigation, route }) {
  const { startDate = '', endDate = '', itemId } = route?.params || {};
  const [message, setMessage] = useState('');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default times: pickup 9 AM, return 6 PM
  const [startTime, setStartTime] = useState(() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; });
  const [endTime,   setEndTime]   = useState(() => { const d = new Date(); d.setHours(18, 0, 0, 0); return d; });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);

  const isSameDay = startDate === endDate;
  // For same-day, return-time must be after start-time
  const sameDayTimeError = isSameDay && endTime <= startTime;

  useEffect(() => {
    if (!itemId) { setLoading(false); return; }
    const fetchItem = async () => {
      try {
        const res = await getItemByIdApi(itemId);
        const data = res.data?.item || res.data;
        setItem({
          id:          data._id,
          title:       data.title,
          price:       data.price,
          deposit:     data.deposit || 0,
          serviceFee:  data.serviceFee || 0,
        });
      } catch (err) {
        setError(err.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  // Charge at least 1 day, even for same-day rentals (mirrors backend logic)
  const rawDays = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)
    : 0;
  const days = Math.max(rawDays, startDate ? 1 : 0);

  const rentTotal = item ? item.price * days : 0;
  const total     = item ? rentTotal + item.deposit + item.serviceFee : 0;

  const Row = ({ label, value, bold }) => (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>{label}</Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownValueBold]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Booking</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Item not found'}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item summary */}
        <View style={styles.itemCard}>
          <View style={styles.itemPhoto}>
            <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDates}>
              {isSameDay ? startDate : `${startDate}  →  ${endDate}`}
            </Text>
            <Text style={styles.itemNights}>
              {days} {days === 1 ? 'day' : 'days'}{isSameDay ? ' (same-day)' : ''}
            </Text>
          </View>
        </View>

        {/* Pickup & Return Time */}
        <Text style={styles.sectionTitle}>Pickup & Return Time</Text>
        <View style={styles.timeCard}>
          <TouchableOpacity style={styles.timeRow} onPress={() => setShowStartPicker(true)}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.timeLabel}>Pickup time</Text>
            <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
          <View style={styles.timeDivider} />
          <TouchableOpacity style={styles.timeRow} onPress={() => setShowEndPicker(true)}>
            <Ionicons name="time-outline" size={18} color={colors.accent} />
            <Text style={styles.timeLabel}>Return time</Text>
            <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
        </View>

        {sameDayTimeError && (
          <Text style={styles.timeErrorText}>
            Return time must be after pickup time for same-day rentals.
          </Text>
        )}

        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selected) setStartTime(selected);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selected) setEndTime(selected);
            }}
          />
        )}

        {/* Price breakdown */}
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.breakdownCard}>
          <Row label={`₹${item.price} × ${days} ${days === 1 ? 'day' : 'days'}`}  value={`₹${rentTotal}`} />
          {item.deposit > 0 && (
            <Row label="Refundable deposit" value={`₹${item.deposit}`} />
          )}
          {item.serviceFee > 0 && (
            <Row label="Service fee" value={`₹${item.serviceFee}`} />
          )}
          <View style={styles.breakdownDivider} />
          <Row label="Total" value={`₹${total}`} bold />
        </View>

        {/* Message to owner */}
        <Text style={styles.sectionTitle}>
          Message to owner <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Hi, I'd like to rent your item for a weekend trip..."
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            Your card will be charged only after the owner accepts your request. The deposit is returned after safe return.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total due now</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.requestButton, sameDayTimeError && styles.buttonDisabled]}
          onPress={() => {
            if (sameDayTimeError) return;
            navigation.navigate('Checkout', {
              total,
              startDate: combineDateTime(startDate, startTime),
              endDate:   combineDateTime(endDate,   endTime),
              itemId: item.id,
              message: message.trim(),
            });
          }}
          disabled={sameDayTimeError}
          activeOpacity={0.85}
        >
          <Text style={styles.requestButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText:       { ...typography.body, color: colors.error, textAlign: 'center' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  backButton:      { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { ...typography.h3, color: colors.textPrimary },
  content:         { padding: spacing.xl, paddingBottom: 120 },
  itemCard:        { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl, gap: spacing.lg, borderWidth: 1, borderColor: colors.border },
  itemPhoto:       { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  itemInfo:        { flex: 1, justifyContent: 'center' },
  itemTitle:       { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  itemDates:       { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  itemNights:      { ...typography.caption, color: colors.primary, fontWeight: '700' },
  sectionTitle:    { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  optional:        { ...typography.bodySmall, color: colors.textMuted, fontWeight: '400' },
  breakdownCard:   { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  breakdownRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  breakdownLabel:  { ...typography.body, color: colors.textSecondary },
  breakdownLabelBold: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  breakdownValue:  { ...typography.body, color: colors.textPrimary },
  breakdownValueBold: { ...typography.h3, color: colors.textPrimary },
  breakdownDivider:{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  messageInput:    { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: spacing.lg, ...typography.body, color: colors.textPrimary, height: 100, marginBottom: spacing.xl },
  infoBox:         { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#EFF6FF', borderRadius: radius.lg, padding: spacing.lg },
  infoText:        { flex: 1, ...typography.bodySmall, color: '#1D4ED8', lineHeight: 20 },
  footer:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalLabel:      { ...typography.body, color: colors.textSecondary },
  totalAmount:     { ...typography.h2, color: colors.textPrimary },
  requestButton:   { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  requestButtonText: { ...typography.button, color: colors.textInverse },
  buttonDisabled:  { opacity: 0.45 },
  timeCard:        { backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  timeRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  timeLabel:       { ...typography.body, color: colors.textPrimary, flex: 1 },
  timeValue:       { ...typography.body, color: colors.primary, fontWeight: '700' },
  timeDivider:     { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  timeErrorText:   { ...typography.bodySmall, color: colors.error, marginBottom: spacing.lg, textAlign: 'center' },
});
