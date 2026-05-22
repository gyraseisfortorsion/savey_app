import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/src/api/transactionApi';
import { format, startOfMonth, endOfMonth, subMonths, subDays, addDays } from 'date-fns';

export type Period = 'weekly' | 'monthly' | '6months';

function toIso(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  if (period === 'weekly') return { start: subDays(now, 6), end: now };
  if (period === 'monthly') return { start: startOfMonth(now), end: endOfMonth(now) };
  return { start: subMonths(now, 6), end: now };
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  color?: string;
}

export function useCategoryBreakdown(period: Period = 'monthly') {
  return useQuery({
    queryKey: ['category-breakdown', period],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      const txns = await getTransactions({
        transaction_type: 'expense',
        start_date: toIso(start),
        end_date: toIso(end),
        limit: 500,
      });

      const map: Record<string, { name: string; total: number; color?: string }> = {};
      for (const t of txns) {
        const key = t.category_id ?? 'uncategorized';
        if (!map[key]) map[key] = { name: t.category?.name ?? 'Other', total: 0, color: t.category?.color };
        map[key].total += t.amount;
      }

      const totalSpend = Object.values(map).reduce((s, v) => s + v.total, 0);
      return Object.entries(map).map(([id, v]): CategoryBreakdownItem => ({
        categoryId: id,
        categoryName: v.name,
        total: v.total,
        percentage: totalSpend > 0 ? (v.total / totalSpend) * 100 : 0,
        color: v.color,
      })).sort((a, b) => b.total - a.total);
    },
  });
}

// ─── Monthly Bar Data ─────────────────────────────────────────────────────────

export interface MonthlyBarItem {
  month: string; // label: day name, week label, or month abbrev
  income: number;
  expense: number;
}

export function useMonthlyBarData(period: Period = '6months') {
  return useQuery({
    queryKey: ['monthly-bar', period],
    queryFn: async () => {
      const now = new Date();

      if (period === 'weekly') {
        const start = subDays(now, 6);
        const txns = await getTransactions({ start_date: toIso(start), end_date: toIso(now), limit: 500 });
        return Array.from({ length: 7 }, (_, i) => {
          const day = subDays(now, 6 - i);
          const dayStr = toIso(day);
          const dayTxns = txns.filter((t) => t.date === dayStr);
          return {
            month: format(day, 'EEE'),
            income: dayTxns.filter((t) => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0),
            expense: dayTxns.filter((t) => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
          };
        });
      }

      if (period === 'monthly') {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const txns = await getTransactions({ start_date: toIso(monthStart), end_date: toIso(monthEnd), limit: 500 });
        return [1, 2, 3, 4].map((w): MonthlyBarItem => {
          const wStart = addDays(monthStart, (w - 1) * 7);
          const wEnd = w === 4 ? monthEnd : addDays(monthStart, w * 7 - 1);
          const wTxns = txns.filter((t) => t.date >= toIso(wStart) && t.date <= toIso(wEnd));
          return {
            month: `Wk ${w}`,
            income: wTxns.filter((t) => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0),
            expense: wTxns.filter((t) => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
          };
        });
      }

      // 6months
      const months = [0, 1, 2, 3, 4, 5].map((i) => subMonths(now, 5 - i));
      const results = await Promise.all(
        months.map((m) => getTransactions({ start_date: toIso(startOfMonth(m)), end_date: toIso(endOfMonth(m)), limit: 500 }))
      );
      return months.map((m, i): MonthlyBarItem => {
        const txns = results[i];
        return {
          month: format(m, 'MMM'),
          income: txns.filter((t) => t.transaction_type === 'income').reduce((s, t) => s + Number(t.amount), 0),
          expense: txns.filter((t) => t.transaction_type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
        };
      });
    },
  });
}

// ─── Trend Data ───────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  balance: number;
}

export function useSixMonthTrend(period: Period = '6months') {
  return useQuery({
    queryKey: ['six-month-trend', period],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      const txns = await getTransactions({ start_date: toIso(start), end_date: toIso(end), limit: 1000 });

      const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
      let runningBalance = 0;
      const points: TrendPoint[] = [];
      for (const t of sorted) {
        runningBalance += t.transaction_type === 'income' ? t.amount : -t.amount;
        const last = points[points.length - 1];
        if (last?.date === t.date) last.balance = runningBalance;
        else points.push({ date: t.date, balance: runningBalance });
      }
      return points;
    },
  });
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

const MERCHANT_KEYWORDS: [string, string][] = [
  ['apple music', 'Apple Music'],
  ['youtube premium', 'YouTube Premium'],
  ['google play', 'Google Play'],
  ['spotify', 'Spotify'],
  ['netflix', 'Netflix'],
  ['steam', 'Steam'],
  ['yandex', 'Yandex'],
  ['kaspi', 'Kaspi'],
  ['amazon', 'Amazon'],
  ['youtube', 'YouTube Premium'],
];

const MOCK_AVG_KZT: Record<string, number> = {
  Spotify: 3_200,
  Netflix: 4_800,
  'Apple Music': 2_900,
  Steam: 9_000,
  'YouTube Premium': 2_200,
  Yandex: 12_000,
  Kaspi: 5_000,
  'Google Play': 3_500,
  Amazon: 15_000,
};

const CATEGORY_AVG_KZT: Record<string, number> = {
  'Food & Drink': 52_000,
  Food: 52_000,
  Transport: 18_000,
  Entertainment: 14_000,
  Shopping: 35_000,
  Health: 8_000,
  Healthcare: 8_000,
};

export interface BenchmarkResult {
  label: string;
  userAmount: number;
  avgAmount: number;
  percentDiff: number;
  type: 'merchant' | 'category';
}

export function useBenchmarks(period: Period = 'monthly') {
  return useQuery({
    queryKey: ['benchmarks', period],
    queryFn: async () => {
      const { start, end } = getDateRange(period);
      const txns = await getTransactions({
        transaction_type: 'expense',
        start_date: toIso(start),
        end_date: toIso(end),
        limit: 500,
      });

      const merchantTotals: Record<string, number> = {};
      const categoryTotals: Record<string, number> = {};

      for (const t of txns) {
        const desc = (t.description ?? '').toLowerCase();
        for (const [keyword, label] of MERCHANT_KEYWORDS) {
          if (desc.includes(keyword)) {
            merchantTotals[label] = (merchantTotals[label] ?? 0) + Number(t.amount);
            break;
          }
        }
        const catName = t.category?.name ?? '';
        if (catName && CATEGORY_AVG_KZT[catName] !== undefined) {
          categoryTotals[catName] = (categoryTotals[catName] ?? 0) + Number(t.amount);
        }
      }

      const results: BenchmarkResult[] = [];

      for (const [label, userAmount] of Object.entries(merchantTotals)) {
        const avgAmount = MOCK_AVG_KZT[label];
        if (avgAmount && userAmount > 0) {
          results.push({ label, userAmount, avgAmount, percentDiff: ((userAmount - avgAmount) / avgAmount) * 100, type: 'merchant' });
        }
      }

      for (const [label, userAmount] of Object.entries(categoryTotals)) {
        const avgAmount = CATEGORY_AVG_KZT[label];
        if (avgAmount && userAmount > 0) {
          results.push({ label, userAmount, avgAmount, percentDiff: ((userAmount - avgAmount) / avgAmount) * 100, type: 'category' });
        }
      }

      return results.sort((a, b) => Math.abs(b.percentDiff) - Math.abs(a.percentDiff));
    },
  });
}
