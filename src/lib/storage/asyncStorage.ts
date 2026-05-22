import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'savey_theme_mode';

export async function getTheme(): Promise<'system' | 'light' | 'dark' | null> {
  const val = await AsyncStorage.getItem(THEME_KEY);
  if (val === 'light' || val === 'dark' || val === 'system') return val;
  return null;
}

export async function setTheme(mode: 'system' | 'light' | 'dark'): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}
