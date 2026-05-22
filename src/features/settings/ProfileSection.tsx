import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export function ProfileSection() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();

  const initial = (user?.full_name || user?.email || 'U')[0].toUpperCase();
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>{email}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    marginBottom: 32,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E2432',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  email: { fontSize: 13 },
});
