import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isToday } from 'date-fns';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useCreateTransaction } from '@/src/hooks/useTransactions';
import { useCategories } from '@/src/hooks/useCategories';
import { useAuthStore } from '@/src/stores/authStore';
import { getCurrencySymbol } from '@/src/constants/currencies';
import { TransactionType } from '@/src/types/transaction';
import { CategoryResponse } from '@/src/types/category';

const SHEET_HEIGHT = 660;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddTransactionSheet({ visible, onClose }: Props) {
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync: create, isPending } = useCreateTransaction();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const currencySymbol = getCurrencySymbol(user?.currency ?? 'USD');
  const selectedCategory = categories?.find((c) => String(c.id) === categoryId);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      // Reset form when closed
      setType('expense');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(new Date());
      setError('');
      setShowCategoryPicker(false);
      setShowDatePicker(false);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    try {
      await create({
        amount: parsed,
        transaction_type: type,
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        date: format(date, 'yyyy-MM-dd'),
      });
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const formattedDate = isToday(date)
    ? `Today, ${format(date, 'MMM d')}`
    : format(date, 'EEE, MMM d');

  const sheetBg = isDark ? '#1C1D24' : '#FFFFFF';
  const inputBg = isDark ? '#262730' : '#F5F4F2';
  const inputBorder = isDark ? '#2E3039' : '#EFEFEF';
  const handleColor = isDark ? '#3A3B44' : '#D9D9D9';
  const closeBtnBg = isDark ? '#262730' : '#F5F4F2';
  const subtitleColor = isDark ? '#8A8D96' : '#8A8A8A';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Dimmed backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Slide-up sheet */}
        <Animated.View
          style={[styles.sheet, { backgroundColor: sheetBg, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.title, { color: colors.text }]}>Add Transaction</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: closeBtnBg }]} onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              Enter the details of your transaction.
            </Text>

            {/* Fields */}
            <View style={styles.fields}>
              {/* Type Toggle */}
              <View style={[styles.typeToggle, { backgroundColor: inputBg }]}>
                <TouchableOpacity
                  style={[
                    styles.typeTab,
                    type === 'expense' && [styles.typeTabActive, isDark && { backgroundColor: '#3A3B44' }],
                  ]}
                  onPress={() => setType('expense')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={type === 'expense' ? '#E53935' : '#ABABAB'}
                  />
                  <Text style={[styles.typeTabText, { color: type === 'expense' ? colors.text : '#ABABAB' }]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeTab,
                    type === 'income' && [styles.typeTabActive, isDark && { backgroundColor: '#3A3B44' }],
                  ]}
                  onPress={() => setType('income')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trending-down"
                    size={16}
                    color={type === 'income' ? '#2E7D32' : '#ABABAB'}
                  />
                  <Text style={[styles.typeTabText, { color: type === 'income' ? colors.text : '#ABABAB' }]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Ionicons name="cash-outline" size={16} color="#2E7D32" />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Amount</Text>
                </View>
                <View style={[styles.amountInput, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                  <Text style={[styles.amountSymbol, { color: colors.text }]}>{currencySymbol}</Text>
                  <TextInput
                    value={amount}
                    onChangeText={(v) => { setAmount(v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')); setError(''); }}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#ABABAB"
                    style={[styles.amountValue, { color: colors.text }]}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#2E7D32" />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
                </View>
                <TouchableOpacity
                  style={[styles.pickerInput, { backgroundColor: inputBg, borderColor: inputBorder }]}
                  onPress={() => setShowCategoryPicker((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerValue, { color: selectedCategory ? colors.text : '#ABABAB' }]}>
                    {selectedCategory ? selectedCategory.title : 'Select category'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#ABABAB" />
                </TouchableOpacity>

                {showCategoryPicker && (
                  <View style={[styles.categoryList, { backgroundColor: sheetBg, borderColor: inputBorder }]}>
                    {categoriesLoading ? (
                      <Text style={[styles.categoryItemText, { color: subtitleColor, padding: 16 }]}>Loading…</Text>
                    ) : categoriesError ? (
                      <Text style={[styles.categoryItemText, { color: '#E53935', padding: 16 }]}>Failed to load categories</Text>
                    ) : !categories?.length ? (
                      <Text style={[styles.categoryItemText, { color: subtitleColor, padding: 16 }]}>No categories found</Text>
                    ) : (
                      categories.map((cat: CategoryResponse) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryItem,
                            { borderBottomColor: inputBorder },
                            cat.id === categoryId && { backgroundColor: '#2E7D3212' },
                          ]}
                          onPress={() => { setCategoryId(String(cat.id) === categoryId ? '' : String(cat.id)); setShowCategoryPicker(false); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.categoryItemText, { color: colors.text }]}>
                            {cat.title}
                          </Text>
                          {cat.id === categoryId && (
                            <Ionicons name="checkmark" size={16} color="#2E7D32" />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Description</Text>
                  <Text style={[styles.optionalLabel, { color: subtitleColor }]}>Optional</Text>
                </View>
                <View style={[styles.textInput, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What was this for?"
                    placeholderTextColor="#ABABAB"
                    style={[styles.textInputField, { color: colors.text }]}
                  />
                </View>
              </View>

              {/* Date */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Ionicons name="calendar-outline" size={16} color="#2E7D32" />
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Date</Text>
                </View>
                <TouchableOpacity
                  style={[styles.pickerInput, { backgroundColor: inputBg, borderColor: inputBorder }]}
                  onPress={() => setShowDatePicker((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pickerValue, { color: colors.text }]}>{formattedDate}</Text>
                  <Ionicons name="chevron-down" size={16} color="#ABABAB" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                    maximumDate={new Date()}
                    onChange={(_, selected) => {
                      if (Platform.OS === 'android') setShowDatePicker(false);
                      if (selected) setDate(selected);
                    }}
                    style={{ marginTop: 8 }}
                  />
                )}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonArea}>
              <TouchableOpacity
                style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isPending}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>{isPending ? 'Saving…' : 'Save Transaction'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { height: SHEET_HEIGHT, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { paddingBottom: 32 },

  handleArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 0 },
  handle: { width: 40, height: 4, borderRadius: 2 },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  title: { fontSize: 22, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  subtitle: { fontSize: 13, paddingHorizontal: 28, marginTop: 4 },

  fields: { paddingHorizontal: 28, paddingTop: 20, gap: 20 },

  typeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    height: 48,
    padding: 4,
    gap: 4,
  },
  typeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10 },
  typeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  typeTabText: { fontSize: 14, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },

  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '500', fontFamily: 'Outfit-Medium' },
  optionalLabel: { fontSize: 12, fontFamily: 'Outfit-Regular' },

  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    gap: 8,
  },
  amountSymbol: { fontSize: 22, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },
  amountValue: { flex: 1, fontSize: 22, fontWeight: '500', fontFamily: 'Outfit-Medium' },

  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  pickerValue: { fontSize: 16, fontWeight: '500', fontFamily: 'Outfit-Medium' },

  textInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  textInputField: { fontSize: 16, fontWeight: '500', fontFamily: 'Outfit-Medium', flex: 1 },

  categoryList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 200,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryItemText: { fontSize: 15, fontFamily: 'Outfit-Medium' },

  errorText: { color: '#E53935', fontSize: 12, fontFamily: 'Outfit-Regular' },

  buttonArea: { paddingHorizontal: 28, paddingTop: 24 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit-SemiBold' },
});
