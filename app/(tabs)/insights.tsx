import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { MonthlyBarChart } from '@/src/features/insights/MonthlyBarChart';
import { TrendLineChart } from '@/src/features/insights/TrendLineChart';
import { CategoryBreakdownList } from '@/src/features/insights/CategoryBreakdownList';
import { BenchmarkCard } from '@/src/features/insights/BenchmarkCard';
import { useQueryClient } from '@tanstack/react-query';
import { useCategoryBreakdown, useBenchmarks, Period } from '@/src/hooks/useInsights';
import { useBalanceStore } from '@/src/stores/balanceStore';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: '6months', label: '6 Months' },
];

export default function InsightsScreen() {
  const { colors } = useAppTheme();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<Period>('monthly');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: categories } = useCategoryBreakdown(period);
  const { data: benchmarks } = useBenchmarks(period);
  const balance = useBalanceStore((s) => s.balance);

  const onRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    setRefreshing(false);
  };

  // Dynamic AI prediction text
  const aiText = React.useMemo(() => {
    const limit = balance?.monthly_limit ?? 0;
    const spending = balance?.monthly_spending ?? 0;
    if (!limit) return 'Set a monthly budget in settings to unlock spending predictions.';
    const usedPct = Math.round((spending / limit) * 100);
    const topCat = categories?.[0];
    if (topCat) {
      const reducePct = Math.max(5, Math.round((usedPct - 80) * 0.5));
      return `Based on your spending, you'll use ~${usedPct}% of your monthly budget. Consider reducing ${topCat.categoryName} by ${reducePct}% to stay on track.`;
    }
    return `Based on your spending, you'll use ~${usedPct}% of your monthly budget this month.`;
  }, [balance, categories]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>Insights</Text>

      {/* Segmented control */}
      <View style={[styles.segmented, { backgroundColor: colors.surfaceVariant }]}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.segOption,
              period === p.value && [styles.segActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setPeriod(p.value)}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: period === p.value ? '600' : '500',
                color: period === p.value ? colors.text : colors.textSecondary,
              }}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SPEND OVERVIEW section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SPEND OVERVIEW</Text>
        </View>
        <MonthlyBarChart period={period} />
      </View>

      {/* TRENDS section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>TRENDS</Text>
        </View>
        <TrendLineChart period={period} />
      </View>

      {/* CATEGORIES section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>CATEGORIES</Text>
        </View>
        <CategoryBreakdownList period={period} />
      </View>

      {/* BENCHMARKS section */}
      {benchmarks && benchmarks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>BENCHMARKS</Text>
          </View>
          <View style={styles.benchmarkSubtitle}>
            <Text style={[styles.benchmarkDesc, { color: colors.textSecondary }]}>
              How your spending compares to others in your country
            </Text>
          </View>
          {benchmarks.slice(0, 4).map((b) => (
            <BenchmarkCard key={b.label} data={b} />
          ))}
        </View>
      )}

      {/* AI Prediction card */}
      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={16} color="#4CAF50" />
          <Text style={styles.aiLabel}>AI PREDICTION</Text>
        </View>
        <Text style={styles.aiText}>{aiText}</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 28, paddingBottom: 28, gap: 32 },
  title: { fontSize: 28, fontWeight: '600' },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    height: 48,
    gap: 4,
  },
  segOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  section: { gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLine: { width: 24, height: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 3 },
  benchmarkSubtitle: { marginTop: -8 },
  benchmarkDesc: { fontSize: 13 },
  aiCard: {
    backgroundColor: '#1E2432',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiLabel: { color: '#4CAF50', fontSize: 11, fontWeight: '600', letterSpacing: 2 },
  aiText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 21 },
});
