import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useWeeklyComparison, useMonthlyNet } from '@/src/hooks/useDashboard';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';

export function StatsGrid() {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const { data: weekly } = useWeeklyComparison();
  const { net: monthlyNet } = useMonthlyNet();

  const weekChange =
    weekly && weekly.lastWeekTotal > 0
      ? ((weekly.thisWeekTotal - weekly.lastWeekTotal) / weekly.lastWeekTotal) * 100
      : null;
  const weekPositive = weekChange !== null && weekChange <= 0;

  const netIsPositive = monthlyNet !== null && monthlyNet >= 0;

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AT A GLANCE</Text>
      </View>

      <View style={styles.grid}>
        {/* Card 1: Spent this week */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardVal, { color: colors.text }]}>
            {formatCurrency(weekly?.thisWeekTotal ?? 0, currency)}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Spent this week</Text>
          {weekChange !== null && (
            <View style={[styles.badge, { backgroundColor: weekPositive ? colors.incomeBg : colors.expenseBg }]}>
              <Ionicons
                name={weekPositive ? 'trending-down' : 'trending-up'}
                size={12}
                color={weekPositive ? colors.income : colors.expense}
              />
              <Text style={[styles.badgeText, { color: weekPositive ? colors.income : colors.expense }]}>
                {weekChange > 0 ? '+' : ''}{weekChange.toFixed(0)}%
              </Text>
            </View>
          )}
        </View>

        {/* Card 2: Monthly net */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardVal, { color: colors.text }]}>
            {monthlyNet !== null ? formatCurrency(Math.abs(monthlyNet), currency) : '—'}
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {monthlyNet !== null && monthlyNet < 0 ? 'Deficit this month' : 'Saved this month'}
          </Text>
          {monthlyNet !== null && (
            <View style={[styles.badge, { backgroundColor: netIsPositive ? colors.incomeBg : colors.expenseBg }]}>
              <Ionicons
                name={netIsPositive ? 'trending-up' : 'trending-down'}
                size={12}
                color={netIsPositive ? colors.income : colors.expense}
              />
              <Text style={[styles.badgeText, { color: netIsPositive ? colors.income : colors.expense }]}>
                {netIsPositive ? '▲ saving' : '▼ over'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 28, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLine: { width: 24, height: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 3 },
  grid: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardVal: { fontSize: 22, fontWeight: '700', lineHeight: 22 },
  cardLabel: { fontSize: 13, fontWeight: '500' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
