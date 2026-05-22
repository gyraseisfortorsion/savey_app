import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useCategoryBreakdown, Period } from '@/src/hooks/useInsights';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

export function CategoryBreakdownList({ period = 'monthly' }: { period?: Period }) {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const { data } = useCategoryBreakdown(period);

  if (!data || data.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {data.map((item, i) => {
        const isLast = i === data.length - 1;
        const color = item.color ?? COLORS[i % COLORS.length];
        return (
          <React.Fragment key={item.categoryId}>
            <View style={styles.row}>
              {/* Color dot + category name */}
              <View style={[styles.colorDot, { backgroundColor: color }]} />
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.categoryName}</Text>

              {/* Amount + percentage */}
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.total, currency)}</Text>
                <Text style={[styles.pct, { color: colors.textSecondary }]}>{item.percentage.toFixed(0)}%</Text>
              </View>
            </View>
            {!isLast && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  name: { flex: 1, fontSize: 14, fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { fontSize: 14, fontWeight: '600' },
  pct: { fontSize: 11 },
  divider: { height: 1 },
});
