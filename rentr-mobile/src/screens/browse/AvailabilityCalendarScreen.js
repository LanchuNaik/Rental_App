// ============================================
// Availability Calendar Screen
// ============================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getAvailabilityApi } from '../../services/item.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function AvailabilityCalendarScreen({ navigation, route }) {
  const { itemId, availableFrom, availableTo } = route?.params || {};
  const today = new Date();
  const [year,         setYear]         = useState(today.getFullYear());
  const [month,        setMonth]        = useState(today.getMonth());
  const [startDate,    setStartDate]    = useState(null);
  const [endDate,      setEndDate]      = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const availFrom = availableFrom ? new Date(availableFrom) : null;
  const availTo   = availableTo   ? new Date(availableTo)   : null;

  useEffect(() => {
    if (!itemId) return;
    const fetchAvailability = async () => {
      setLoadingDates(true);
      try {
        const res = await getAvailabilityApi(itemId);
        const data = res.data || [];
        const allDates = [];
        data.forEach((entry) => {
          if (typeof entry === 'string') {
            allDates.push(entry.slice(0, 10));
          } else if (entry.startDate && entry.endDate) {
            const s = new Date(entry.startDate);
            const e = new Date(entry.endDate);
            for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
              allDates.push(d.toISOString().slice(0, 10));
            }
          }
        });
        setBlockedDates(allDates);
      } catch {
        // silently keep no blocked dates on error
      } finally {
        setLoadingDates(false);
      }
    };
    fetchAvailability();
  }, [itemId]);

  const cells = buildCalendar(year, month);

  const dateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const isBlocked    = (day) => blockedDates.includes(dateStr(day));
  const isPast       = (day) => new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isOutOfRange = (day) => {
    const d = new Date(year, month, day);
    if (availFrom && d < new Date(availFrom.getFullYear(), availFrom.getMonth(), availFrom.getDate())) return true;
    if (availTo   && d > new Date(availTo.getFullYear(),   availTo.getMonth(),   availTo.getDate()))   return true;
    return false;
  };

  const isStart   = (day) => startDate === dateStr(day);
  const isEnd     = (day) => endDate   === dateStr(day);
  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d > new Date(startDate) && d < new Date(endDate);
  };

  const handleDayPress = (day) => {
    if (isBlocked(day) || isPast(day) || isOutOfRange(day)) return;
    const ds = dateStr(day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(ds); setEndDate(null);
    } else {
      if (ds < startDate) { setStartDate(ds); setEndDate(null); }
      else                { setEndDate(ds); }
    }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const nights = startDate && endDate
    ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    : 0;

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Dates</Text>
        <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); }}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loadingDates && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading availability...</Text>
          </View>
        )}

        {(availFrom || availTo) && (
          <View style={styles.availBanner}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.availBannerText}>
              Available{availFrom ? ` from ${availFrom.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
              {availTo ? ` to ${availTo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
            </Text>
          </View>
        )}

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>
          {DAYS.map((d) => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`empty-${i}`} style={styles.cell} />;
            const blocked   = isBlocked(day);
            const past      = isPast(day);
            const outRange  = isOutOfRange(day);
            const start     = isStart(day);
            const end       = isEnd(day);
            const inRange   = isInRange(day);
            const disabled  = blocked || past || outRange;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.cell,
                  inRange  && styles.cellInRange,
                  (start || end) && styles.cellSelected,
                  (past || outRange) && !blocked && styles.cellDisabled,
                  blocked && styles.cellBlocked,
                ]}
                onPress={() => handleDayPress(day)}
                disabled={disabled}
              >
                <Text style={[
                  styles.cellText,
                  (start || end) && styles.cellTextSelected,
                  inRange  && styles.cellTextInRange,
                  (past || outRange) && !blocked && styles.cellTextDisabled,
                  blocked && styles.cellTextBlocked,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Selected / Range</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.selectionInfo}>
          {startDate ? (
            <Text style={styles.selectionText}>
              {startDate}{endDate ? ` → ${endDate}  (${nights} night${nights !== 1 ? 's' : ''})` : '  — pick end date'}
            </Text>
          ) : (
            <Text style={styles.selectionPlaceholder}>Tap a date to start</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, (!startDate || !endDate) && styles.buttonDisabled]}
          onPress={() => navigation.navigate('BookingRequest', { startDate, endDate, itemId })}
          disabled={!startDate || !endDate}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  backButton:     { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { ...typography.h3, color: colors.textPrimary },
  clearText:      { ...typography.body, color: colors.primary, fontWeight: '600' },
  loadingRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.sm },
  loadingText:    { ...typography.bodySmall, color: colors.textSecondary },
  availBanner:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.primaryLight, borderRadius: radius.md },
  availBannerText:{ ...typography.bodySmall, color: colors.primary, fontWeight: '600', flex: 1 },
  monthNav:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  navBtn:         { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  monthTitle:     { ...typography.h3, color: colors.textPrimary },
  dayHeaders:     { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  dayHeader:      { flex: 1, textAlign: 'center', ...typography.caption, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg },
  cell:           { width: `${100 / 7}%`, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  cellSelected:   { backgroundColor: colors.primary, borderRadius: radius.full },
  cellInRange:    { backgroundColor: colors.primaryLight },
  cellDisabled:   { opacity: 0.35 },
  cellBlocked:    { backgroundColor: '#FEE2E2', borderRadius: radius.full, borderWidth: 1, borderColor: colors.error },
  cellText:       { ...typography.body, color: colors.textPrimary },
  cellTextSelected: { color: colors.textInverse, fontWeight: '700' },
  cellTextInRange:  { color: colors.primary, fontWeight: '600' },
  cellTextDisabled: { color: colors.textMuted },
  cellTextBlocked:  { color: colors.error, fontWeight: '700', textDecorationLine: 'line-through' },
  legend:         { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, padding: spacing.xl },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot:      { width: 10, height: 10, borderRadius: radius.full },
  legendText:     { ...typography.caption, color: colors.textSecondary },
  footer:         { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.xl },
  selectionInfo:  { marginBottom: spacing.md },
  selectionText:  { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' },
  selectionPlaceholder: { ...typography.bodySmall, color: colors.textMuted },
  continueButton: { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  buttonDisabled: { opacity: 0.45 },
  continueButtonText: { ...typography.button, color: colors.textInverse },
});
