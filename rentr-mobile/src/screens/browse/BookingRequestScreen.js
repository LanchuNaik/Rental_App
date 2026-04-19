// ============================================
// Booking Request Screen
// ============================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getItemByIdApi } from '../../services/item.service';

export default function BookingRequestScreen({ navigation, route }) {
  const { startDate = '', endDate = '', itemId } = route?.params || {};
  const [message, setMessage] = useState('');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const nights = startDate && endDate
    ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    : 0;

  const rentTotal = item ? item.price * nights : 0;
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
            <Text style={styles.itemDates}>{startDate}  →  {endDate}</Text>
            <Text style={styles.itemNights}>{nights} night{nights !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Price breakdown */}
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.breakdownCard}>
          <Row label={`₹${item.price} × ${nights} nights`}  value={`₹${rentTotal}`} />
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
          style={styles.requestButton}
          onPress={() =>
            navigation.navigate('Checkout', {
              total,
              startDate,
              endDate,
              itemId: item.id,
              message: message.trim(),
            })
          }
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
});
