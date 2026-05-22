import { create } from 'zustand';
import { UserResponse, UserUpdate } from '@/src/types/user';
import { LoginRequest, RegisterRequest } from '@/src/types/auth';
import { login, register, getMe, updateUser } from '@/src/api/authApi';
import { setToken, deleteToken } from '@/src/lib/storage/secureStore';
import { useBalanceStore } from './balanceStore';

interface AuthStore {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;

  restoreSession: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user, balance } = await getMe();
      useBalanceStore.getState().setBalance(balance);
      set({ user, isLoading: false });
    } catch {
      // No valid session — stay on login
      set({ user: null, isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const token = await login(data);
      await setToken(token.access_token);
      const { user, balance } = await getMe();
      useBalanceStore.getState().setBalance(balance);
      set({ user, isLoading: false });
    } catch (e: unknown) {
      set({ error: extractMessage(e), isLoading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const token = await register(data);
      await setToken(token.access_token);
      const { user, balance } = await getMe();
      useBalanceStore.getState().setBalance(balance);
      set({ user, isLoading: false });
    } catch (e: unknown) {
      set({ error: extractMessage(e), isLoading: false });
      throw e;
    }
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true, error: null });
    try {
      const updated = await updateUser(user.id, data);
      set({ user: updated, isLoading: false });
    } catch (e: unknown) {
      set({ error: extractMessage(e), isLoading: false });
      throw e;
    }
  },

  logout: () => {
    deleteToken();
    useBalanceStore.getState().clearBalance();
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

function extractMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Something went wrong';
}
