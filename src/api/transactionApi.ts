import { apiClient } from '@/src/lib/api/axios';
import {
  TransactionResponse,
  TransactionCreate,
  TransactionUpdate,
  TransactionWithBalance,
  BulkTransactionWithBalance,
  DeleteWithBalance,
  TransactionType,
} from '@/src/types/transaction';

interface GetTransactionsParams {
  skip?: number;
  limit?: number;
  transaction_type?: TransactionType;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

export async function getTransactions(params: GetTransactionsParams = {}): Promise<TransactionResponse[]> {
  const res = await apiClient.get<TransactionResponse[]>('/transactions', { params });
  return res.data;
}

export async function createTransaction(data: TransactionCreate): Promise<TransactionWithBalance> {
  const res = await apiClient.post<TransactionWithBalance>('/transactions', data);
  return res.data;
}

export async function updateTransaction(id: string, data: TransactionUpdate): Promise<TransactionResponse> {
  const res = await apiClient.put<TransactionResponse>(`/transactions/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id: string): Promise<DeleteWithBalance> {
  const res = await apiClient.delete<DeleteWithBalance>(`/transactions/${id}`);
  return res.data;
}

export async function bulkCreateTransactions(
  transactions: TransactionCreate[],
  statement_date?: string
): Promise<BulkTransactionWithBalance> {
  const res = await apiClient.post<BulkTransactionWithBalance>('/transactions/bulk', {
    transactions,
    ...(statement_date ? { statement_date } : {}),
  });
  return res.data;
}
