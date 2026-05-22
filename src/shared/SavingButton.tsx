import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'danger';
}

export function SavingButton({ label, onPress, loading, disabled, style, variant = 'primary' }: Props) {
  const { colors } = useAppTheme();
  const bg = variant === 'danger' ? colors.error : colors.primary;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.btn, { backgroundColor: bg, opacity: isDisabled ? 0.6 : 1 }, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
