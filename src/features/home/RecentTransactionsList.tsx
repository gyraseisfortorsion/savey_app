import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useRecentTransactions } from '@/src/hooks/useDashboard';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDateWithTime } from '@/utils/dateFormatter';
import { TransactionResponse } from '@/src/types/transaction';
import { EditTransactionSheet } from '@/src/features/transactions/EditTransactionSheet';

export function RecentTransactionsList() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const { data: transactions, isLoading } = useRecentTransactions();
  const [editTx, setEditTx] = useState<TransactionResponse | null>(null);

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENT ACTIVITY</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/transactions')}>
          <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {isLoading && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>Loading...</Text>
        )}
        {!isLoading && (!transactions || transactions.length === 0) && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No transactions yet</Text>
        )}

        {transactions?.map((t, i) => {
          const isExpense = t.transaction_type === 'expense';
          const isLast = i === transactions.length - 1;
          return (
            <React.Fragment key={t.id}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setEditTx(t)}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={[styles.iconWrap, { backgroundColor: isExpense ? colors.expenseBg : colors.incomeBg }]}>
                  <Ionicons
                    name={isExpense ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={isExpense ? colors.expense : colors.income}
                  />
                </View>

                {/* Content */}
                <View style={styles.txContent}>
                  <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={1}>
                    {t.description || t.category?.title || 'Transaction'}
                  </Text>
                  <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                    {formatDateWithTime(t.created_at || t.date)}
                    {t.category?.title ? ` · ${t.category.title}` : ''}
                  </Text>
                </View>

                {/* Amount */}
                <Text style={[styles.txAmount, { color: isExpense ? colors.expense : colors.income }]}>
                  {isExpense ? '−' : '+'}{formatCurrency(t.amount, currency)}
                </Text>
              </TouchableOpacity>

              {!isLast && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <EditTransactionSheet transaction={editTx} onClose={() => setEditTx(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 28, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLine: { width: 24, height: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 3 },
  seeAll: { fontSize: 13, fontWeight: '500' },
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txContent: { flex: 1, gap: 2 },
  txDesc: { fontSize: 14, fontWeight: '500' },
  txDate: { fontSize: 12 },
  txAmount: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 0 },
  empty: { textAlign: 'center', padding: 24, fontSize: 14 },
});
