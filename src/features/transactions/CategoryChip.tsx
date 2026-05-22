import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryResponse } from '@/src/types/category';
import { useAppTheme } from '@/src/hooks/useAppTheme';

interface Props {
  category?: CategoryResponse;
}

export function CategoryChip({ category }: Props) {
  const { colors } = useAppTheme();
  if (!category) return null;

  return (
    <View style={[styles.chip, { backgroundColor: colors.primary + '20' }]}>
      <Text style={[styles.text, { color: colors.primary }]}>
        {category.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
