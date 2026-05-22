import { create } from 'zustand';
import { getTheme, setTheme } from '@/src/lib/storage/asyncStorage';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'system',

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await setTheme(mode);
  },

  loadTheme: async () => {
    const saved = await getTheme();
    if (saved) set({ themeMode: saved });
  },
}));
