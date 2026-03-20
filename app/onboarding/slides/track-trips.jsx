import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

export default function TrackTripsSlide() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <PlusCircle color="#3B82F6" size={48} />
      </View>
      <Text style={styles.title}>Log Your Trips</Text>
      <Text style={styles.subtitle}>Quick and simple entry</Text>

      <View style={styles.previewCard}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Platform</Text>
          <View style={styles.formValue}>
            <Text style={styles.formValueText}>Uber</Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Earnings</Text>
          <View style={styles.formValue}>
            <Text style={styles.formValueText}>$45.00</Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Miles</Text>
          <View style={styles.formValue}>
            <Text style={styles.formValueText}>18.5</Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Time</Text>
          <View style={styles.formValue}>
            <Text style={styles.formValueText}>1h 15m</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>
        Add individual trips or log your whole day's earnings at once.
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
    backgroundColor: '#DBEAFE',
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
  previewCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  formLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  formValue: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
