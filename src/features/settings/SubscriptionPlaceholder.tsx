import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  'Unlimited AI transaction logs',
  'Advanced insights & predictions',
  'Multi-account tracking',
  'CSV & PDF export',
];

export function SubscriptionPlaceholder() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.planLabel}>Savey Pro</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>$4.99</Text>
          <Text style={styles.priceUnit}>/mo</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
        <Text style={styles.btnText}>Start Free Trial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
    marginBottom: 32,
    backgroundColor: '#2E7D32',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  priceBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  priceText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  priceUnit: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  features: { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  btn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
});
