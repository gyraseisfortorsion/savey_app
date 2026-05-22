import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useBalanceStore } from '@/src/stores/balanceStore';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';

function barColor(ratio: number): string {
  if (ratio >= 1) return '#E53935';
  if (ratio >= 0.75) return '#F59E0B';
  return '#4CAF50';
}

interface LimitBarProps {
  label: string;
  spending: number;
  limit: number;
  currency: string;
}

function LimitBar({ label, spending, limit, currency }: LimitBarProps) {
  const ratio = Math.min(spending / limit, 1);
  const color = barColor(ratio);
  const left = limit - spending;

  return (
    <View style={styles.budgetSection}>
      <View style={styles.budgetRow}>
        <Text style={styles.budgetLabel}>{label}</Text>
        <Text style={styles.budgetVal}>
          {formatCurrency(spending, currency)} / {formatCurrency(limit, currency)}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(ratio * 100)}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.budgetLeft}>
        {left > 0
          ? `${formatCurrency(left, currency)} left`
          : `${formatCurrency(Math.abs(left), currency)} over limit`}
      </Text>
    </View>
  );
}

export function BalanceCard({ onSetBudget }: { onSetBudget?: () => void }) {
  const balance = useBalanceStore((s) => s.balance);
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';

  const hasMonthly = balance ? balance.monthly_limit > 0 : false;
  const hasDaily = balance ? balance.daily_limit > 0 : false;

  return (
    <View style={styles.card}>
      {/* Balance */}
      <View style={styles.balanceLeft}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceAmount}>
          {balance ? formatCurrency(balance.balance, currency) : '—'}
        </Text>
      </View>

      {/* State A: no limits — show hint */}
      {!hasMonthly && !hasDaily && (
        <TouchableOpacity style={styles.setBudgetRow} onPress={onSetBudget} activeOpacity={0.7}>
          <Text style={styles.setBudgetText}>Set a budget →</Text>
        </TouchableOpacity>
      )}

      {/* State B: monthly limit only */}
      {hasMonthly && !hasDaily && balance && (
        <LimitBar
          label="Monthly Budget"
          spending={balance.monthly_spending}
          limit={balance.monthly_limit}
          currency={currency}
        />
      )}

      {/* State C: both limits */}
      {hasMonthly && hasDaily && balance && (
        <>
          <LimitBar
            label="Monthly Budget"
            spending={balance.monthly_spending}
            limit={balance.monthly_limit}
            currency={currency}
          />
          <LimitBar
            label="Daily Budget"
            spending={balance.daily_spending}
            limit={balance.daily_limit}
            currency={currency}
          />
        </>
      )}

      {/* Daily only (edge case) */}
      {!hasMonthly && hasDaily && balance && (
        <LimitBar
          label="Daily Budget"
          spending={balance.daily_spending}
          limit={balance.daily_limit}
          currency={currency}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E2432',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 28,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLeft: { gap: 4 },
  balanceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  setBudgetRow: { alignSelf: 'flex-start' },
  setBudgetText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
  },
  budgetSection: { gap: 6 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { color: 'rgba(255,255,255,0.56)', fontSize: 13, fontWeight: '500' },
  budgetVal: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  budgetLeft: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
});
