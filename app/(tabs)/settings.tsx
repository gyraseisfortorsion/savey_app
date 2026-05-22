import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuthStore } from '@/src/stores/authStore';
import { ProfileSection } from '@/src/features/settings/ProfileSection';
import { ThemeToggle } from '@/src/features/settings/ThemeToggle';
import { CurrencyPicker } from '@/src/features/settings/CurrencyPicker';
import { BudgetGoalsPlaceholder } from '@/src/features/settings/BudgetGoalsPlaceholder';
import { SubscriptionPlaceholder } from '@/src/features/settings/SubscriptionPlaceholder';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <ProfileSection />
      <SubscriptionPlaceholder />

      {/* GENERAL section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.headerLine, { backgroundColor: colors.text }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>GENERAL</Text>
        </View>
        <View style={[styles.generalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemeToggle />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <CurrencyPicker />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <BudgetGoalsPlaceholder />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutBtn}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 28, paddingBottom: 28 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 32 },
  section: { gap: 16, marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLine: { width: 24, height: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 3 },
  generalCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  divider: { height: 1 },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  logoutText: { fontWeight: '600', fontSize: 15 },
});
