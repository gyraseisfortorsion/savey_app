import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { SUPPORTED_CURRENCIES, getCurrencySymbol, getCurrencyLabel } from '@/src/constants/currencies';

export function CurrencyPicker() {
  const { colors } = useAppTheme();
  const { user, updateProfile } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = SUPPORTED_CURRENCIES.filter((c) => {
    const q = search.toLowerCase();
    return c.toLowerCase().includes(q) || getCurrencySymbol(c).toLowerCase().includes(q);
  });

  const handleSelect = async (currency: string) => {
    setVisible(false);
    try {
      await updateProfile({ currency });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update currency');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]}>Currency</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{getCurrencyLabel(user?.currency ?? 'USD')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.search, { backgroundColor: colors.surface, color: colors.text }]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.currencyRow, { borderBottomColor: colors.border }]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.currencyText, { color: colors.text }]}>{getCurrencyLabel(item)}</Text>
                {item === user?.currency && <Text style={{ color: colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, fontWeight: '500' },
  modal: { flex: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  search: { borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  currencyRow: { paddingVertical: 14, borderBottomWidth: 0.5, flexDirection: 'row', justifyContent: 'space-between' },
  currencyText: { fontSize: 16 },
});
