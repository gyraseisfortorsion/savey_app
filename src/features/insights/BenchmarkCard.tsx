import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';
import { BenchmarkResult } from '@/src/hooks/useInsights';

export function BenchmarkCard({ data }: { data: BenchmarkResult }) {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'KZT';

  const max = Math.max(data.userAmount, data.avgAmount, 1);
  const userBarPct = data.userAmount / max;
  const avgBarPct = data.avgAmount / max;

  const isOver = data.percentDiff > 5;
  const isUnder = data.percentDiff < -5;
  const badgeBg = isOver ? 'rgba(229,57,53,0.12)' : isUnder ? 'rgba(46,125,50,0.12)' : colors.surfaceVariant;
  const badgeColor = isOver ? colors.expense : isUnder ? colors.income : colors.textSecondary;
  const userBarColor = isOver ? colors.expense : colors.primary;
  const sign = data.percentDiff > 0 ? '+' : '';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.label, { color: colors.text }]}>{data.label}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>avg in Kazakhstan</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {sign}{data.percentDiff.toFixed(0)}% vs avg
          </Text>
        </View>
      </View>

      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: colors.textSecondary }]}>You</Text>
          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.barFill, { width: `${userBarPct * 100}%` as any, backgroundColor: userBarColor }]} />
          </View>
          <Text style={[styles.barAmount, { color: colors.text }]}>{formatCurrency(data.userAmount, currency)}</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Avg</Text>
          <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.barFill, { width: `${avgBarPct * 100}%` as any, backgroundColor: colors.textSecondary }]} />
          </View>
          <Text style={[styles.barAmount, { color: colors.textSecondary }]}>{formatCurrency(data.avgAmount, currency)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: { gap: 2 },
  label: { fontSize: 14, fontWeight: '600' },
  subtitle: { fontSize: 11 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  bars: { gap: 8 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: { fontSize: 11, width: 26 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barAmount: { fontSize: 11, fontWeight: '500', minWidth: 72, textAlign: 'right' },
});
