import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/src/api/transactionApi';
import { TransactionResponse } from '@/src/types/transaction';
import { useBalanceStore } from '@/src/stores/balanceStore';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

function toIso(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function sumByDay(txns: TransactionResponse[], days: Date[]): number[] {
  return days.map((day) => {
    const dayStr = toIso(day);
    return txns
      .filter((t) => t.date === dayStr && t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => getTransactions({ skip: 0, limit: 5 }),
  });
}

export function useWeeklyComparison() {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subDays(thisWeekStart, 7);
  const lastWeekEnd = subDays(thisWeekEnd, 7);

  return useQuery({
    queryKey: ['weekly-comparison'],
    queryFn: async () => {
      const [thisWeekTxns, lastWeekTxns] = await Promise.all([
        getTransactions({ start_date: toIso(thisWeekStart), end_date: toIso(thisWeekEnd), limit: 100 }),
        getTransactions({ start_date: toIso(lastWeekStart), end_date: toIso(lastWeekEnd), limit: 100 }),
      ]);

      const days = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const d = new Date(thisWeekStart);
        d.setDate(d.getDate() + i);
        return d;
      });
      const lastDays = days.map((d) => subDays(d, 7));

      return {
        thisWeek: sumByDay(thisWeekTxns, days),
        lastWeek: sumByDay(lastWeekTxns, lastDays),
        thisWeekTotal: thisWeekTxns
          .filter((t) => t.transaction_type === 'expense')
          .reduce((s, t) => s + Number(t.amount), 0),
        lastWeekTotal: lastWeekTxns
          .filter((t) => t.transaction_type === 'expense')
          .reduce((s, t) => s + Number(t.amount), 0),
      };
    },
  });
}

export function useMonthlyIncome() {
  const now = new Date();
  const start = toIso(startOfMonth(now));
  const end = toIso(endOfMonth(now));

  return useQuery({
    queryKey: ['monthly-income', start],
    queryFn: async () => {
      const txns = await getTransactions({
        transaction_type: 'income',
        start_date: start,
        end_date: end,
        limit: 100,
      });
      return txns.reduce((s, t) => s + Number(t.amount), 0);
    },
  });
}

/** Monthly net = income this month − spending this month (from balanceStore) */
export function useMonthlyNet() {
  const now = new Date();
  const start = toIso(startOfMonth(now));
  const end = toIso(endOfMonth(now));
  const monthlySpending = useBalanceStore((s) => s.balance?.monthly_spending ?? 0);

  const incomeQuery = useQuery({
    queryKey: ['monthly-income', start],
    queryFn: async () => {
      const txns = await getTransactions({
        transaction_type: 'income',
        start_date: start,
        end_date: end,
        limit: 100,
      });
      return txns.reduce((s, t) => s + Number(t.amount), 0);
    },
  });

  return {
    isLoading: incomeQuery.isLoading,
    net: incomeQuery.data !== undefined ? incomeQuery.data - monthlySpending : null,
  };
}
