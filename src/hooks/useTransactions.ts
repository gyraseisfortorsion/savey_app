import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/src/api/transactionApi';
import { useBalanceStore } from '@/src/stores/balanceStore';
import { TransactionCreate, TransactionUpdate } from '@/src/types/transaction';

export const TRANSACTIONS_KEY = ['transactions'] as const;

export function useTransactions(params?: Parameters<typeof getTransactions>[0]) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => getTransactions(params),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const setBalance = useBalanceStore((s) => s.setBalance);

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      setBalance(data.balance);
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ['recent-transactions'] });
      qc.invalidateQueries({ queryKey: ['weekly-comparison'] });
      qc.invalidateQueries({ queryKey: ['monthly-income'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdate }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const setBalance = useBalanceStore((s) => s.setBalance);

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (data) => {
      setBalance(data.balance);
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ['recent-transactions'] });
      qc.invalidateQueries({ queryKey: ['weekly-comparison'] });
      qc.invalidateQueries({ queryKey: ['monthly-income'] });
    },
  });
}
