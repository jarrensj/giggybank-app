import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

export default function RealEarningsSlide() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TrendingUp color="#059669" size={48} />
      </View>
      <Text style={styles.title}>See Your True Hourly Rate</Text>
      <Text style={styles.subtitle}>Know exactly what you're making</Text>

      <View style={styles.dashboardPreview}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today's Take-Home</Text>
          <Text style={styles.heroAmount}>$76.42</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$18.50</Text>
            <Text style={styles.statLabel}>True Hourly</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.statValueRed]}>$38.58</Text>
            <Text style={styles.statLabel}>Set Aside</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>
        Your dashboard shows take-home pay after all deductions and exactly how much to save for taxes.
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
    backgroundColor: '#ECFDF5',
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
  dashboardPreview: {
    width: '100%',
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  statValueRed: {
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
