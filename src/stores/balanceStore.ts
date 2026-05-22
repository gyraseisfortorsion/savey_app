import { create } from 'zustand';
import { UserBalance } from '@/src/types/transaction';

interface BalanceStore {
  balance: UserBalance | null;
  setBalance: (balance: UserBalance) => void;
  clearBalance: () => void;
}

export const useBalanceStore = create<BalanceStore>((set) => ({
  balance: null,
  setBalance: (balance) => set({ balance }),
  clearBalance: () => set({ balance: null }),
}));
