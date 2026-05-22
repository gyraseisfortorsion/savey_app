import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function NotFoundScreen() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.emoji]}>🔍</Text>
      <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
      <Link href="/(tabs)" style={[styles.link, { color: colors.primary }]}>
        Go to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  link: { fontSize: 16, fontWeight: '600' },
});
