import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { UserBalance } from '@/src/types/transaction';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';

interface Props {
  balance: UserBalance;
}

export function BalanceMiniCard({ balance }: Props) {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';

  const hasDaily = balance.daily_limit > 0;
  const hasMonthly = balance.monthly_limit > 0;

  const dailyPct = hasDaily ? Math.min((balance.daily_spending / balance.daily_limit) * 100, 100) : 0;
  const monthlyPct = hasMonthly ? Math.min((balance.monthly_spending / balance.monthly_limit) * 100, 100) : 0;

  const dailyWarn = hasDaily && dailyPct >= 75;
  const monthlyWarn = hasMonthly && monthlyPct >= 75;

  const dailyColor = dailyPct >= 100 ? '#E53935' : dailyPct >= 75 ? '#FF8F00' : '#2E7D32';
  const monthlyColor = monthlyPct >= 100 ? '#E53935' : monthlyPct >= 75 ? '#FF8F00' : '#2E7D32';

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {/* Balance row */}
      <View style={styles.balanceRow}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {formatCurrency(balance.balance, currency)}
        </Text>
      </View>

      {/* Daily spending */}
      {hasDaily && (
        <View style={styles.limitSection}>
          <View style={styles.limitRow}>
            <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Today's Spending</Text>
            <Text style={[styles.limitValue, { color: colors.text }]}>
              {formatCurrency(balance.daily_spending, currency)}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.borderStrong }]}>
            <View style={[styles.progressFill, { width: `${dailyPct}%`, backgroundColor: dailyColor }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.pctText, { color: dailyColor }]}>{dailyPct.toFixed(0)}% of daily budget</Text>
            <Text style={[styles.limitCap, { color: colors.textSecondary }]}>
              {formatCurrency(balance.daily_limit, currency)}
            </Text>
          </View>
        </View>
      )}

      {/* Monthly spending */}
      {hasMonthly && (
        <View style={styles.limitSection}>
          <View style={styles.limitRow}>
            <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>This Month</Text>
            <Text style={[styles.limitValue, { color: colors.text }]}>
              {formatCurrency(balance.monthly_spending, currency)}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.borderStrong }]}>
            <View style={[styles.progressFill, { width: `${monthlyPct}%`, backgroundColor: monthlyColor }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.pctText, { color: monthlyColor }]}>{monthlyPct.toFixed(0)}% of monthly budget</Text>
            <Text style={[styles.limitCap, { color: colors.textSecondary }]}>
              {formatCurrency(balance.monthly_limit, currency)}
            </Text>
          </View>
        </View>
      )}

      {/* Warning */}
      {(dailyWarn || monthlyWarn) && (
        <View style={[styles.warning, { backgroundColor: dailyPct >= 100 || monthlyPct >= 100 ? '#FFEBEE' : '#FFF8E1' }]}>
          <Ionicons
            name="warning-outline"
            size={13}
            color={dailyPct >= 100 || monthlyPct >= 100 ? '#E53935' : '#FF8F00'}
          />
          <Text style={[styles.warningText, { color: dailyPct >= 100 || monthlyPct >= 100 ? '#E53935' : '#FF8F00' }]}>
            {dailyPct >= 100 || monthlyPct >= 100
              ? "You've exceeded your budget!"
              : "You're approaching your limit!"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 12, fontWeight: '500' },
  balanceAmount: { fontSize: 16, fontWeight: '700' },
  limitSection: { gap: 6 },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: { fontSize: 12, fontWeight: '500' },
  limitValue: { fontSize: 13, fontWeight: '600' },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pctText: { fontSize: 11, fontWeight: '500' },
  limitCap: { fontSize: 11 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  warningText: { fontSize: 12, fontWeight: '500', flexShrink: 1 },
});
