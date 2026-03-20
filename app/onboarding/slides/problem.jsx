import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, Minus } from 'lucide-react-native';

export default function ProblemSlide() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertTriangle color="#DC2626" size={48} />
      </View>
      <Text style={styles.title}>Gross Pay ≠ Real Earnings</Text>
      <Text style={styles.subtitle}>Your app shows you one number...</Text>

      <View style={styles.comparisonCard}>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>App Shows</Text>
          <Text style={styles.comparisonValue}>$150</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.deductionRow}>
          <Text style={styles.deductionLabel}>Gas & Mileage</Text>
          <Text style={styles.deductionValue}>- $22</Text>
        </View>
        <View style={styles.deductionRow}>
          <Text style={styles.deductionLabel}>Self-Employment Tax</Text>
          <Text style={styles.deductionValue}>- $20</Text>
        </View>
        <View style={styles.deductionRow}>
          <Text style={styles.deductionLabel}>Income Tax</Text>
          <Text style={styles.deductionValue}>- $32</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.comparisonRow}>
          <Text style={styles.actualLabel}>Actually Yours</Text>
          <Text style={styles.actualValue}>$76</Text>
        </View>
      </View>

      <Text style={styles.description}>
        After expenses and taxes, your real take-home is often half what the app shows.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  comparisonCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  comparisonLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  deductionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  deductionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deductionValue: {
    fontSize: 14,
    color: '#DC2626',
  },
  actualLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  actualValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
