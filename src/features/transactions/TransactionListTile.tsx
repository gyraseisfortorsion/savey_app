import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransactionResponse } from '@/src/types/transaction';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/dateFormatter';
import { CategoryChip } from './CategoryChip';

interface Props {
  transaction: TransactionResponse;
  onPress?: () => void;
}

export function TransactionListTile({ transaction: t, onPress }: Props) {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const isExpense = t.transaction_type === 'expense';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: isExpense ? colors.expense : colors.income }]} />
      <View style={styles.left}>
        <Text style={[styles.desc, { color: colors.text }]} numberOfLines={1}>
          {t.description || t.category?.name || 'Transaction'}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(t.date)}</Text>
          <CategoryChip category={t.category} />
        </View>
      </View>
      <Text style={[styles.amount, { color: isExpense ? colors.expense : colors.income }]}>
        {isExpense ? '-' : '+'}{formatCurrency(t.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  typeIndicator: { width: 4, alignSelf: 'stretch' },
  left: { flex: 1, padding: 14 },
  desc: { fontSize: 15, fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  date: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '700', paddingRight: 14 },
});
