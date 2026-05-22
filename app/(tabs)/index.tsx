import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuthStore } from '@/src/stores/authStore';
import { useTransactions } from '@/src/hooks/useTransactions';
import { BalanceCard } from '@/src/features/home/BalanceCard';
import { StatsGrid } from '@/src/features/home/StatsGrid';
import { RecentTransactionsList } from '@/src/features/home/RecentTransactionsList';
import { AIQuickLog } from '@/src/features/home/AIQuickLog';
import { AddTransactionSheet } from '@/src/features/home/AddTransactionSheet';
import { BudgetGoalsSheet } from '@/src/features/settings/BudgetGoalsSheet';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { refetch, isRefetching } = useTransactions({ limit: 1 });
  const [sheetVisible, setSheetVisible] = useState(false);
  const [budgetSheetVisible, setBudgetSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: ['recent-transactions'] });
      qc.invalidateQueries({ queryKey: ['weekly-comparison'] });
      qc.invalidateQueries({ queryKey: ['monthly-income'] });
    }, [qc])
  );

  const greeting = getGreeting();
  const firstName = user?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{firstName || 'there'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { borderColor: colors.borderStrong }]}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <BalanceCard onSetBudget={() => setBudgetSheetVisible(true)} />
        <StatsGrid />
        <RecentTransactionsList />
        <AIQuickLog />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setSheetVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTransactionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
      <BudgetGoalsSheet visible={budgetSheetVisible} onClose={() => setBudgetSheetVisible(false)} />
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  content: { paddingTop: 60, paddingBottom: 120, gap: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  headerLeft: { gap: 2 },
  greeting: { fontSize: 14, fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '600', lineHeight: 31 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
