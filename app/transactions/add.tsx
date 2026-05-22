import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useCreateTransaction } from '@/src/hooks/useTransactions';
import { useCategories } from '@/src/hooks/useCategories';
import { SavingButton } from '@/src/shared/SavingButton';
import { todayIsoDate } from '@/utils/dateFormatter';
import { TransactionType } from '@/src/types/transaction';

export default function AddTransactionScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { mutateAsync: create, isPending } = useCreateTransaction();
  const { data: categories } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayIsoDate());

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    try {
      await create({
        amount: parsed,
        transaction_type: type,
        description: description || undefined,
        category_id: categoryId || undefined,
        date,
      });
      router.back();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    }
  };

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

        {/* Amount */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            style={[styles.amountInput, { color: type === 'expense' ? colors.expense : colors.income, borderBottomColor: colors.border }]}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2024-01-15"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        {/* Category */}
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
                    {
                      backgroundColor: cat.id === categoryId ? colors.primary : colors.surfaceVariant,
                      marginRight: 8,
                    },
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

        <SavingButton label="Save Transaction" onPress={handleSave} loading={isPending} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 4 },
  typeRow: { flexDirection: 'row', borderRadius: 12, padding: 3, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  amountInput: { fontSize: 40, fontWeight: '700', textAlign: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  catChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtn: { marginTop: 12 },
});
