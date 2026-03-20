import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Rocket } from 'lucide-react-native';

export default function GetStartedSlide({ onComplete }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Rocket color="#3B82F6" size={48} />
      </View>
      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>Start tracking your real earnings</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>What you'll get:</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.summaryText}>True hourly rate after all costs</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.summaryText}>Exact tax set-aside amounts</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.summaryText}>Weekly and monthly summaries</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.summaryText}>CSV exports for tax time</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Start Tracking</Text>
      </TouchableOpacity>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
