import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isToday, isYesterday, parseISO, format } from 'date-fns';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAuthStore } from '@/src/stores/authStore';
import { formatCurrency } from '@/utils/currencyFormatter';
import { TransactionResponse, TransactionType } from '@/src/types/transaction';
import { EmptyState } from '@/src/shared/EmptyState';
import { AddTransactionSheet } from '@/src/features/home/AddTransactionSheet';
import { EditTransactionSheet } from '@/src/features/transactions/EditTransactionSheet';

type Filter = 'all' | TransactionType;

function sectionDateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d');
}

function TransactionRow({
  tx,
  isLast,
  onPress,
  currency,
  isDark,
  colors,
}: {
  tx: TransactionResponse;
  isLast: boolean;
  onPress: () => void;
  currency: string;
  isDark: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  const isExpense = tx.transaction_type === 'expense';
  const iconBg = isExpense
    ? (isDark ? '#3D1517' : '#FFEBEE')
    : (isDark ? '#1A2E1C' : '#E8F5E9');
  const dividerColor = isDark ? '#262730' : '#F5F4F2';
  const label = tx.description || tx.category?.title || 'Transaction';
  const sublabel = tx.description && tx.category?.title ? tx.category.title : undefined;
  const amountStr = `${isExpense ? '−' : '+'}${formatCurrency(tx.amount, currency)}`;

  return (
    <>
      <TouchableOpacity style={styles.txRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons
            name={isExpense ? 'arrow-up' : 'arrow-down'}
            size={18}
            color={isExpense ? '#E53935' : '#2E7D32'}
          />
        </View>
        <View style={styles.txContent}>
          <Text style={[styles.txLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
          {sublabel && (
            <Text style={[styles.txSub, { color: colors.textSecondary }]} numberOfLines={1}>{sublabel}</Text>
          )}
        </View>
        <Text style={[styles.txAmount, { color: isExpense ? '#E53935' : '#2E7D32' }]}>
          {amountStr}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={isDark ? '#3A3B44' : '#D0D0D0'} />
      </TouchableOpacity>
      {!isLast && <View style={[styles.divider, { backgroundColor: dividerColor }]} />}
    </>
  );
}

export default function TransactionsListScreen() {
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency ?? 'USD';
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editTx, setEditTx] = useState<TransactionResponse | null>(null);

  const { data, isLoading, refetch, isRefetching } = useTransactions({ limit: 100 });

  const sections = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = (data ?? []).filter((tx) => {
      if (filter !== 'all' && tx.transaction_type !== filter) return false;
      if (q) {
        return (
          (tx.description ?? '').toLowerCase().includes(q) ||
          (tx.category?.name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    const groups = new Map<string, TransactionResponse[]>();
    filtered.forEach((tx) => {
      if (!groups.has(tx.date)) groups.set(tx.date, []);
      groups.get(tx.date)!.push(tx);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, transactions]) => ({
        date,
        transactions,
        sum: transactions.reduce(
          (acc, tx) => (tx.transaction_type === 'expense' ? acc - tx.amount : acc + tx.amount),
          0
        ),
      }));
  }, [data, filter, search]);

  const inputBg = isDark ? '#262730' : '#F5F4F2';
  const inputBorder = isDark ? '#2E3039' : '#EFEFEF';
  const cardBg = isDark ? '#1C1D24' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sections}
        keyExtractor={(s) => s.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, sections.length === 0 && { flex: 1 }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Filter chips */}
            <View style={styles.filterRow}>
              {(['all', 'expense', 'income'] as Filter[]).map((f) => {
                const active = filter === f;
                const activeBg = isDark ? '#F0F0F2' : '#1E2432';
                const activeText = isDark ? '#121318' : '#FFFFFF';
                const inactiveText = isDark ? '#F0F0F2' : '#1E2432';
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip,
                      active
                        ? { backgroundColor: activeBg }
                        : { borderWidth: 1, borderColor: inputBorder },
                    ]}
                  >
                    {f === 'expense' && (
                      <View style={[styles.chipDot, { backgroundColor: '#E53935' }]} />
                    )}
                    {f === 'income' && (
                      <View style={[styles.chipDot, { backgroundColor: '#2E7D32' }]} />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? activeText : inactiveText },
                      ]}
                    >
                      {f === 'all' ? 'All' : f === 'expense' ? 'Expense' : 'Income'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search bar */}
            <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Ionicons name="search-outline" size={18} color={isDark ? '#5C5F69' : '#ABABAB'} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search transactions..."
                placeholderTextColor={isDark ? '#5C5F69' : '#ABABAB'}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={isDark ? '#5C5F69' : '#ABABAB'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionDate, { color: colors.text }]}>
                {sectionDateLabel(section.date)}
              </Text>
              <Text
                style={[
                  styles.sectionSum,
                  { color: section.sum < 0 ? '#E53935' : '#2E7D32' },
                ]}
              >
                {section.sum < 0 ? '−' : '+'}
                {formatCurrency(Math.abs(section.sum), currency)}
              </Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
              {section.transactions.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  isLast={i === section.transactions.length - 1}
                  onPress={() => setEditTx(tx)}
                  currency={currency}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState title="No transactions" subtitle="Tap + to add your first transaction" icon="💳" />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTransactionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
      <EditTransactionSheet transaction={editTx} onClose={() => setEditTx(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 100 },
  listHeader: { paddingHorizontal: 28, paddingTop: 8, gap: 12, paddingBottom: 8 },

  filterRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
    gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Outfit-Regular' },

  section: { paddingHorizontal: 28, paddingTop: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionDate: { fontSize: 15, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },
  sectionSum: { fontSize: 13, fontWeight: '500', fontFamily: 'Outfit-Medium' },

  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txContent: { flex: 1, gap: 2 },
  txLabel: { fontSize: 15, fontWeight: '500', fontFamily: 'Outfit-Medium' },
  txSub: { fontSize: 12, fontFamily: 'Outfit-Regular' },
  txAmount: { fontSize: 15, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },
  divider: { height: 1, marginLeft: 70 },

  fab: {
    position: 'absolute',
    bottom: 32,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
