import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/src/stores/themeStore';
import { colorPalette, AppColors } from '@/src/constants/colors';

export interface AppTheme {
  colors: AppColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

export function useAppTheme(): AppTheme {
  const { themeMode } = useThemeStore();
  const systemScheme = useColorScheme();
  const resolved: 'light' | 'dark' =
    themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;

  return {
    colors: colorPalette[resolved],
    isDark: resolved === 'dark',
    colorScheme: resolved,
  };
}
