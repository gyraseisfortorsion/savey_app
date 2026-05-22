import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PolarChart, Pie } from 'victory-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useCategoryBreakdown } from '@/src/hooks/useInsights';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];
const { width } = Dimensions.get('window');

export function SpendPieChart() {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const { data, isLoading } = useCategoryBreakdown();

  if (isLoading) {
    return <View style={[styles.placeholder, { backgroundColor: colors.surface }]} />;
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expense data this month</Text>
      </View>
    );
  }

  const pieData = data.map((item, i) => ({
    value: item.total,
    label: item.categoryName,
    color: item.color ?? COLORS[i % COLORS.length],
  }));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Spending by Category</Text>
      <PolarChart
        data={pieData}
        colorKey="color"
        valueKey="value"
        labelKey="label"
      >
        <Pie.Chart innerRadius="50%" />
      </PolarChart>

      {/* Legend */}
      <View style={styles.legend}>
        {data.slice(0, 6).map((item, i) => (
          <View key={item.categoryId} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color ?? COLORS[i % COLORS.length] }]} />
            <Text style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
              {item.categoryName}
            </Text>
            <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
              {formatCurrency(item.total, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 4 },
  placeholder: { height: 300, borderRadius: 16, marginBottom: 16 },
  empty: { borderRadius: 16, padding: 32, marginBottom: 16, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14 },
  legend: { width: '100%', gap: 6, marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13 },
  legendAmount: { fontSize: 13, fontWeight: '600' },
});
