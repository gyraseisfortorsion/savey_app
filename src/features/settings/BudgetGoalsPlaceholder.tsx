import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { BudgetGoalsSheet } from './BudgetGoalsSheet';

export function BudgetGoalsPlaceholder() {
  const { colors } = useAppTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setSheetOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>Budget Goals</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </TouchableOpacity>
      <BudgetGoalsSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});
