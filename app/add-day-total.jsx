import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

import DatePickerField from '../src/components/DatePickerField';
import PlatformDropdown from '../src/components/PlatformDropdown';
import PriceInput from '../src/components/PriceInput';
import NumberInput from '../src/components/NumberInput';
import TimeInput from '../src/components/TimeInput';
import { useEntriesStore } from '../src/stores/entriesStore';
import { formatCurrency } from '../src/utils/calculations';

export default function AddDayTotalScreen() {
  const router = useRouter();
  const addEntry = useEntriesStore((state) => state.addEntry);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [platformId, setPlatformId] = useState('');
  const [basePay, setBasePay] = useState('');
  const [tips, setTips] = useState('');
  const [miles, setMiles] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [gasCost, setGasCost] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  // Calculate total earnings
  const totalEarnings = (parseFloat(basePay) || 0) + (parseFloat(tips) || 0);

  // Convert hours and minutes to decimal hours
  const getDecimalHours = () => {
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    return h + m / 60;
  };

  const handleSave = () => {
    if (!platformId) {
      return;
    }

    addEntry({
      date,
      platformId,
      basePay,
      tips,
      miles,
      hours: getDecimalHours(),
      gasCost,
      entryType: 'day-total',
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Day Total</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              Use this to log your total earnings for an entire day instead of individual trips.
            </Text>
          </View>

          {/* Date Picker */}
          <DatePickerField
            label="Date"
            value={date}
            onChange={setDate}
          />

          {/* Platform */}
          <PlatformDropdown
            label="Platform"
            value={platformId}
            onChange={setPlatformId}
          />

          {/* Earnings Row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <PriceInput
                label="Base Pay"
                value={basePay}
                onChangeText={setBasePay}
              />
            </View>
            <View style={styles.halfInput}>
              <PriceInput
                label="Tips"
                value={tips}
                onChangeText={setTips}
              />
            </View>
          </View>

          {/* Total Earnings Preview */}
          {totalEarnings > 0 && (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalEarnings)}</Text>
            </View>
          )}

          {/* Miles */}
          <NumberInput
            label="Total Miles"
            value={miles}
            onChangeText={setMiles}
            suffix="mi"
          />

          {/* Time */}
          <TimeInput
            label="Total Time Worked"
            hours={hours}
            minutes={minutes}
            onChangeHours={setHours}
            onChangeMinutes={setMinutes}
          />

          {/* Optional Fields Toggle */}
          <TouchableOpacity
            style={styles.optionalToggle}
            onPress={() => setShowOptional(!showOptional)}
          >
            <Text style={styles.optionalToggleText}>
              {showOptional ? '▼ Hide options' : '▶ More options'}
            </Text>
          </TouchableOpacity>

          {/* Optional Fields */}
          {showOptional && (
            <View style={styles.optionalSection}>
              <PriceInput
                label="Gas Cost"
                value={gasCost}
                onChangeText={setGasCost}
              />
            </View>
          )}

          {/* Spacer for button */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !platformId && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!platformId}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Day Total</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1D4ED8',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  optionalToggle: {
    paddingVertical: 12,
  },
  optionalToggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionalSection: {
    marginTop: 8,
  },
  spacer: {
    height: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
