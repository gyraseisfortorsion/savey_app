import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '@/src/stores/themeStore';
import { useAppTheme } from '@/src/hooks/useAppTheme';

type ThemeMode = 'system' | 'light' | 'dark';
const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeToggle() {
  const { colors } = useAppTheme();
  const { themeMode, setThemeMode } = useThemeStore();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>Appearance</Text>
      <View style={[styles.segmented, { backgroundColor: colors.surfaceVariant }]}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setThemeMode(opt.value)}
            style={[
              styles.option,
              themeMode === opt.value && { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={{
                color: themeMode === opt.value ? colors.text : colors.textTertiary,
                fontWeight: themeMode === opt.value ? '600' : '500',
                fontSize: 12,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  segmented: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 6,
  },
});
