import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useMonthlyBarData, MonthlyBarItem, Period } from '@/src/hooks/useInsights';

type ChartDatum = MonthlyBarItem & Record<string, unknown>;

export function MonthlyBarChart({ period = '6months' }: { period?: Period }) {
  const { colors } = useAppTheme();
  const { data, isLoading } = useMonthlyBarData(period);

  if (isLoading || !data) {
    return <View style={[styles.placeholder, { backgroundColor: colors.surface }]} />;
  }

  const chartData = data as ChartDatum[];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <CartesianChart
        data={chartData}
        xKey="month"
        yKeys={['income', 'expense']}
        domainPadding={{ left: 20, right: 20 }}
        axisOptions={{
          font: null,
          labelColor: colors.textSecondary,
          lineColor: colors.border,
        }}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.income}
              chartBounds={chartBounds}
              color={colors.income}
            />
            <Bar
              points={points.expense}
              chartBounds={chartBounds}
              color={colors.expense}
            />
          </>
        )}
      </CartesianChart>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 20, borderWidth: 1, height: 220 },
  placeholder: { height: 220, borderRadius: 16 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
});
