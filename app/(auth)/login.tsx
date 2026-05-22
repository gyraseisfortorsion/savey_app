import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { SavingButton } from '@/src/shared/SavingButton';
import { DEFAULT_CURRENCY } from '@/src/constants/api';

type Tab = 'login' | 'register';

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login');
  const { colors } = useAppTheme();
  const { login, register, isLoading } = useAuthStore();

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regCurrency, setRegCurrency] = useState(DEFAULT_CURRENCY);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
    } catch (e: unknown) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleRegister = async () => {
    if (!regEmail || !regPassword) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        full_name: regName || undefined,
        currency: regCurrency,
      });
    } catch (e: unknown) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Title */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>💰 Savey</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your AI finance companion
          </Text>
        </View>

        {/* Tab Toggle */}
        <View style={[styles.tabRow, { backgroundColor: colors.surfaceVariant, borderRadius: 12 }]}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabBtn,
                tab === t && { backgroundColor: colors.primary, borderRadius: 10 },
              ]}
            >
              <Text style={{ color: tab === t ? '#fff' : colors.textSecondary, fontWeight: '600' }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login Form */}
        {tab === 'login' && (
          <View style={styles.form}>
            <InputField
              label="Email"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
            />
            <InputField
              label="Password"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
              colors={colors}
            />
            <SavingButton label="Sign In" onPress={handleLogin} loading={isLoading} style={styles.btn} />
          </View>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <View style={styles.form}>
            <InputField
              label="Email *"
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
            />
            <InputField
              label="Password *"
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
              colors={colors}
            />
            <InputField
              label="Full Name (optional)"
              value={regName}
              onChangeText={setRegName}
              colors={colors}
            />
            <InputField
              label="Currency"
              value={regCurrency}
              onChangeText={setRegCurrency}
              autoCapitalize="characters"
              colors={colors}
            />
            <SavingButton label="Create Account" onPress={handleRegister} loading={isLoading} style={styles.btn} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
        ]}
        placeholderTextColor={colors.textTertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: '700' },
  tagline: { fontSize: 15, marginTop: 8 },
  tabRow: { flexDirection: 'row', padding: 4, marginBottom: 32 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: { marginTop: 8 },
});
