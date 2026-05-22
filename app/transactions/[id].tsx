import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '@/src/hooks/useTransactions';
import { useCategories } from '@/src/hooks/useCategories';
import { SavingButton } from '@/src/shared/SavingButton';
import { TransactionType } from '@/src/types/transaction';

export default function EditTransactionScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transactions, isLoading } = useTransactions({ limit: 200 });
  const { data: categories } = useCategories();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateTransaction();
  const { mutateAsync: remove, isPending: isDeleting } = useDeleteTransaction();

  const transaction = transactions?.find((t) => t.id === id);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.transaction_type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description ?? '');
      setCategoryId(transaction.category_id ?? '');
      setDate(transaction.date);
    }
  }, [transaction]);

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    try {
      await update({
        id: id!,
        data: {
          amount: parsed,
          transaction_type: type,
          description: description || undefined,
          category_id: categoryId || undefined,
          date,
        },
      });
      router.back();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id!);
            router.back();
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (isLoading || !transaction) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Type toggle */}
        <View style={[styles.typeRow, { backgroundColor: colors.surfaceVariant }]}>
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.typeBtn,
                type === t && { backgroundColor: t === 'expense' ? colors.expense : colors.income },
              ]}
            >
              <Text style={{ color: type === t ? '#fff' : colors.textSecondary, fontWeight: '700', textTransform: 'capitalize' }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: type === 'expense' ? colors.expense : colors.income, borderBottomColor: colors.border }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        {categories && categories.length > 0 && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                  style={[
                    styles.catChip,
                    { backgroundColor: cat.id === categoryId ? colors.primary : colors.surfaceVariant, marginRight: 8 },
                  ]}
                >
                  <Text style={{ color: cat.id === categoryId ? '#fff' : colors.text, fontSize: 13 }}>
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <SavingButton label="Save Changes" onPress={handleSave} loading={isUpdating} style={styles.saveBtn} />
        <SavingButton label="Delete Transaction" onPress={handleDelete} loading={isDeleting} variant="danger" style={styles.deleteBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 4 },
  typeRow: { flexDirection: 'row', borderRadius: 12, padding: 3, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  amountInput: { fontSize: 40, fontWeight: '700', textAlign: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  catChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtn: { marginTop: 12 },
  deleteBtn: { marginTop: 8 },
});
