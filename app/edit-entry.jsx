import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';

import DatePickerField from '../src/components/DatePickerField';
import PlatformDropdown from '../src/components/PlatformDropdown';
import PriceInput from '../src/components/PriceInput';
import NumberInput from '../src/components/NumberInput';
import TimeInput from '../src/components/TimeInput';
import ConfirmDialog from '../src/components/ConfirmDialog';
import { useEntriesStore } from '../src/stores/entriesStore';
import { formatCurrency } from '../src/utils/calculations';

export default function EditEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const entries = useEntriesStore((state) => state.entries);
  const updateEntry = useEntriesStore((state) => state.updateEntry);
  const deleteEntry = useEntriesStore((state) => state.deleteEntry);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find the entry
  const entry = entries.find((e) => e.id === id);

  // Form state
  const [date, setDate] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [basePay, setBasePay] = useState('');
  const [tips, setTips] = useState('');
  const [miles, setMiles] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [gasCost, setGasCost] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  // Load entry data
  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setPlatformId(entry.platformId);
      setBasePay(entry.basePay?.toString() || '');
      setTips(entry.tips?.toString() || '');
      setMiles(entry.miles?.toString() || '');

      const h = Math.floor(entry.hours || 0);
      const m = Math.round(((entry.hours || 0) - h) * 60);
      setHours(h > 0 ? h.toString() : '');
      setMinutes(m > 0 ? m.toString() : '');

      setGasCost(entry.gasCost?.toString() || '');
      setShowOptional(!!entry.gasCost);
    }
  }, [entry]);

  // Calculate total earnings
  const totalEarnings = (parseFloat(basePay) || 0) + (parseFloat(tips) || 0);

  // Convert hours and minutes to decimal hours
  const getDecimalHours = () => {
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    return h + m / 60;
  };

  const handleSave = () => {
    if (!entry || !platformId) return;

    updateEntry(id, {
      date,
      platformId,
      basePay: parseFloat(basePay) || 0,
      tips: parseFloat(tips) || 0,
      miles: parseFloat(miles) || 0,
      hours: getDecimalHours(),
      gasCost: parseFloat(gasCost) || 0,
    });

    router.back();
  };

  const handleDelete = () => {
    deleteEntry(id);
    setShowDeleteConfirm(false);
    router.back();
  };

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Entry not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Entry</Text>
            <View style={[styles.badge, entry.entryType === 'trip' ? styles.badgeTrip : styles.badgeDayTotal]}>
              <Text style={styles.badgeText}>
                {entry.entryType === 'trip' ? 'Trip' : 'Day Total'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.closeButton}
          >
            <Trash2 color="#EF4444" size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            label="Miles"
            value={miles}
            onChangeText={setMiles}
            suffix="mi"
          />

          {/* Time */}
          <TimeInput
            label="Time Worked"
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
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  errorLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
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
  headerCenter: {
    alignItems: 'center',
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
  badge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeTrip: {
    backgroundColor: '#DBEAFE',
  },
  badgeDayTotal: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
