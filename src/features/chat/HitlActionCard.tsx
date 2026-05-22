import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { HitlData } from '@/src/types/message';
import { apiClient } from '@/src/lib/api/axios';
import { useBalanceStore } from '@/src/stores/balanceStore';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSACTIONS_KEY } from '@/src/hooks/useTransactions';

interface Props {
  hitlData: HitlData;
  messageId: string;
}

type State = 'pending' | 'confirmed' | 'cancelled';

export function HitlActionCard({ hitlData, messageId }: Props) {
  const { colors } = useAppTheme();
  const [state, setState] = useState<State>('pending');
  const setBalance = useBalanceStore((s) => s.setBalance);
  const qc = useQueryClient();

  const handleConfirm = async () => {
    try {
      const res = await apiClient.post('/messages/hitl/confirm', {
        message_id: messageId,
        action: hitlData.action,
        payload: hitlData.payload,
      });
      if (res.data?.balance) setBalance(res.data.balance);
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      setState('confirmed');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to confirm action');
    }
  };

  const handleCancel = async () => {
    try {
      await apiClient.post('/messages/hitl/cancel', {
        message_id: messageId,
        action: hitlData.action,
      });
      setState('cancelled');
    } catch {
      setState('cancelled');
    }
  };

  if (state === 'confirmed') {
    return (
      <View style={[styles.card, { backgroundColor: colors.income + '20', borderColor: colors.income }]}>
        <Text style={[styles.status, { color: colors.income }]}>✓ Action confirmed</Text>
      </View>
    );
  }

  if (state === 'cancelled') {
    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[styles.status, { color: colors.textSecondary }]}>✗ Action cancelled</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Action Required</Text>
      {hitlData.description && (
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{hitlData.description}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCancel}
          style={[styles.btn, { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }]}
        >
          <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, maxWidth: '85%' },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  desc: { fontSize: 13, marginBottom: 12 },
  status: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
