// ============================================
// Checkout / Payment Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const SAVED_CARDS = [
  { id: '1', brand: 'Visa',       last4: '4242', expiry: '12/26' },
  { id: '2', brand: 'Mastercard', last4: '5555', expiry: '08/27' },
];

export default function CheckoutScreen({ navigation, route }) {
  const { total = 277 } = route?.params || {};
  const [selectedCard, setSelectedCard] = useState('1');
  const [loading,      setLoading]      = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // TODO: call Stripe PaymentSheet or POST /api/bookings
      await new Promise((resolve) => setTimeout(resolve, 1800));
      navigation.navigate('BookingConfirmation');
    } finally {
      setLoading(false);
    }
  };

  const cardIcon = (brand) => brand === 'Visa' ? 'card' : 'card-outline';

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total amount */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalAmount}>${total}</Text>
          <Text style={styles.totalNote}>Deposit included · Refundable after return</Text>
        </View>

        {/* Saved cards */}
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        {SAVED_CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.cardRow, selectedCard === card.id && styles.cardRowSelected]}
            onPress={() => setSelectedCard(card.id)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.cardIconCircle}>
                <Ionicons name={cardIcon(card.brand)} size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.cardBrand}>{card.brand} •••• {card.last4}</Text>
                <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
              </View>
            </View>
            <View style={[styles.radioOuter, selectedCard === card.id && styles.radioOuterActive]}>
              {selectedCard === card.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Add new card */}
        <TouchableOpacity style={styles.addCardButton}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.addCardText}>Add new card</Text>
        </TouchableOpacity>

        {/* Security note */}
        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={16} color={colors.success} />
          <Text style={styles.securityText}>Payments are encrypted and secured by Stripe</Text>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.buttonDisabled]}
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={colors.textInverse} style={{ marginRight: spacing.sm }} />
              <Text style={styles.payButtonText}>Pay ${total} Securely</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  backButton:    { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { ...typography.h3, color: colors.textPrimary },
  content:       { padding: spacing.xl, paddingBottom: 100 },
  totalCard:     { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.xl },
  totalLabel:    { ...typography.body, color: colors.primaryLight, marginBottom: spacing.sm },
  totalAmount:   { fontSize: 48, fontWeight: '800', color: colors.textInverse, marginBottom: spacing.sm },
  totalNote:     { ...typography.caption, color: colors.primaryLight },
  sectionTitle:  { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  cardRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, marginBottom: spacing.md },
  cardRowSelected: { borderColor: colors.primary, backgroundColor: colors.background },
  cardLeft:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIconCircle:{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardBrand:     { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  cardExpiry:    { ...typography.caption, color: colors.textMuted },
  radioOuter:    { width: 22, height: 22, borderRadius: radius.full, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: colors.primary },
  radioInner:    { width: 12, height: 12, borderRadius: radius.full, backgroundColor: colors.primary },
  addCardButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', marginBottom: spacing.xl },
  addCardText:   { ...typography.body, color: colors.primary, fontWeight: '600' },
  securityRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  securityText:  { ...typography.caption, color: colors.textMuted },
  footer:        { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  payButton:     { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  buttonDisabled:{ opacity: 0.7 },
  payButtonText: { ...typography.button, color: colors.textInverse },
});
