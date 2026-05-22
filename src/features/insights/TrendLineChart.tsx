import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartesianChart, Line } from 'victory-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useSixMonthTrend, TrendPoint, Period } from '@/src/hooks/useInsights';

type ChartDatum = { index: number; balance: number; label: string } & Record<string, unknown>;

export function TrendLineChart({ period = '6months' }: { period?: Period }) {
  const { colors } = useAppTheme();
  const { data, isLoading } = useSixMonthTrend(period);

  if (isLoading) {
    return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} />;
  }

  if (!data || data.length < 2) {
    return (
      <View style={[styles.card, styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="trending-up-outline" size={28} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Add more transactions to see your balance trend
        </Text>
      </View>
    );
  }

  const chartData: ChartDatum[] = data.map((p, i) => ({
    index: i,
    balance: p.balance,
    label: p.date,
  }));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <CartesianChart
        data={chartData}
        xKey="index"
        yKeys={['balance']}
        axisOptions={{
          font: null,
          labelColor: colors.textSecondary,
          lineColor: colors.border,
        }}
      >
        {({ points }) => (
          <Line
            points={points.balance}
            color={colors.primary}
            strokeWidth={2}
            curveType="monotoneX"
          />
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 20, borderWidth: 1, height: 200 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 220 },
});
