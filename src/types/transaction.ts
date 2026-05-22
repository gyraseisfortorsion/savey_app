import { CategoryResponse } from './category';

export type TransactionType = 'income' | 'expense';

export interface TransactionResponse {
  id: string;
  user_id: string;
  category_id?: string;
  category?: CategoryResponse;
  amount: number;
  description?: string;
  transaction_type: TransactionType;
  date: string; // 'YYYY-MM-DD'
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  category_id?: string;
  amount: number;
  description?: string;
  transaction_type: TransactionType;
  date: string; // 'YYYY-MM-DD'
}

export interface TransactionUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  transaction_type?: TransactionType;
  date?: string;
}

export interface UserBalance {
  balance: number;
  monthly_spending: number;
  monthly_limit: number;
  daily_spending: number;
  daily_limit: number;
}

export interface TransactionWithBalance {
  transaction: TransactionResponse;
  balance: UserBalance;
}

export interface BulkTransactionWithBalance {
  transactions: TransactionResponse[];
  balance: UserBalance;
}

export interface DeleteWithBalance {
  balance: UserBalance;
}

export interface TransactionListResponse {
  items: TransactionResponse[];
  total: number;
  page: number;
  size: number;
}
