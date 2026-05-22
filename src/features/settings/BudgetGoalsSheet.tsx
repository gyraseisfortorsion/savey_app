import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  InputAccessoryView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const INPUT_ACCESSORY_ID = 'budget-goals-toolbar';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuthStore } from '@/src/stores/authStore';
import { useBalanceStore } from '@/src/stores/balanceStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}

export function BudgetGoalsSheet({ visible, onClose }: Props) {
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [monthly, setMonthly] = useState('');
  const [daily, setDaily] = useState('');
  const [saving, setSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currencySymbol = getCurrencySymbol(user?.currency ?? 'USD');

  // Pre-fill from current user values
  useEffect(() => {
    if (visible) {
      setMonthly(user?.monthly_limit ? String(user.monthly_limit) : '');
      setDaily(user?.daily_limit ? String(user.daily_limit) : '');
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handleSave = async () => {
    const monthlyVal = monthly ? parseInt(monthly.replace(/[^0-9]/g, ''), 10) : null;
    const dailyVal = daily ? parseInt(daily.replace(/[^0-9]/g, ''), 10) : null;
    setSaving(true);
    try {
      await updateProfile({ monthly_limit: monthlyVal, daily_limit: dailyVal });
      // Patch balance store limits immediately without extra round-trip
      const bs = useBalanceStore.getState();
      if (bs.balance) {
        bs.setBalance({
          ...bs.balance,
          monthly_limit: monthlyVal ?? 0,
          daily_limit: dailyVal ?? 0,
        });
      }
      dismiss();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await updateProfile({ monthly_limit: null, daily_limit: null });
      const bs = useBalanceStore.getState();
      if (bs.balance) {
        bs.setBalance({ ...bs.balance, monthly_limit: 0, daily_limit: 0 });
      }
      setMonthly('');
      setDaily('');
      dismiss();
    } finally {
      setSaving(false);
    }
  };

  const sheetBg = isDark ? '#1C1D24' : '#FFFFFF';
  const handleColor = isDark ? '#3A3B44' : '#D9D9D9';
  const inputBg = isDark ? '#262730' : '#F5F4F2';
  const inputBorder = isDark ? '#2E3039' : '#EFEFEF';
  const subtitleColor = isDark ? '#8A8D96' : '#8A8A8A';
  const closeBtnBg = isDark ? '#262730' : '#F5F4F2';

  return (
    <>
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.root}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: sheetBg, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Budget Goals</Text>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: closeBtnBg }]} onPress={dismiss}>
              <Ionicons name="close" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Set spending limits to stay on track. Both are optional.
          </Text>

          {/* Fields */}
          <View style={styles.fields}>
            {/* Monthly */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.labelText, { color: colors.text }]}>Monthly Limit</Text>
                <Text style={[styles.optional, { color: colors.textTertiary }]}>Optional</Text>
              </View>
              <View style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Text style={[styles.currencySymbol, { color: monthly ? colors.text : colors.textTertiary }]}>
                  {currencySymbol}
                </Text>
                <TextInput
                  style={[styles.inputText, { color: colors.text }]}
                  value={monthly}
                  onChangeText={(text) => setMonthly(text.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 150,000"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  returnKeyType="next"
                  inputAccessoryViewID={INPUT_ACCESSORY_ID}
                />
              </View>
              <Text style={[styles.hint, { color: subtitleColor }]}>
                Maximum amount you want to spend per month
              </Text>
            </View>

            {/* Daily */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.labelText, { color: colors.text }]}>Daily Limit</Text>
                <Text style={[styles.optional, { color: colors.textTertiary }]}>Optional</Text>
              </View>
              <View style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Text style={[styles.currencySymbol, { color: daily ? colors.text : colors.textTertiary }]}>
                  {currencySymbol}
                </Text>
                <TextInput
                  style={[styles.inputText, { color: colors.text }]}
                  value={daily}
                  onChangeText={(text) => setDaily(text.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 10,000"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  returnKeyType="done"
                  inputAccessoryViewID={INPUT_ACCESSORY_ID}
                />
              </View>
              <Text style={[styles.hint, { color: subtitleColor }]}>
                Maximum amount you want to spend per day
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonArea}>
            <TouchableOpacity
              style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Limits'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              disabled={saving}
            >
              <Text style={styles.clearBtnText}>Clear All Limits</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View />
        </InputAccessoryView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleArea: { alignItems: 'center', paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  title: { fontSize: 22, fontWeight: '600', fontFamily: 'Outfit_600SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 13, paddingHorizontal: 28, marginTop: 8, lineHeight: 18 },
  fields: { gap: 24, paddingHorizontal: 28, paddingTop: 24 },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontSize: 14, fontWeight: '500', fontFamily: 'Outfit_500Medium', flex: 1 },
  optional: { fontSize: 12, fontFamily: 'Outfit_400Regular' },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    gap: 8,
  },
  currencySymbol: { fontSize: 18, fontWeight: '600', fontFamily: 'Outfit_600SemiBold' },
  inputText: { flex: 1, fontSize: 18, fontFamily: 'Outfit_500Medium' },
  hint: { fontSize: 12, fontFamily: 'Outfit_400Regular' },
  buttonArea: { gap: 12, paddingHorizontal: 28, paddingTop: 24 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit_600SemiBold' },
  clearBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { color: '#E53935', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit_500Medium' },
});
