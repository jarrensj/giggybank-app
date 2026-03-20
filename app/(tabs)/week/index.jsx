import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';

import { useEntriesStore } from '../../../src/stores/entriesStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import {
  aggregateEntriesForWeek,
  formatCurrency,
  formatHours,
} from '../../../src/utils/calculations';
import ConfirmDialog from '../../../src/components/ConfirmDialog';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekScreen() {
  const entries = useEntriesStore((state) => state.entries);
  const caAdjustments = useEntriesStore((state) => state.caAdjustments);
  const addCAdjustment = useEntriesStore((state) => state.addCAdjustment);
  const deleteCAdjustment = useEntriesStore((state) => state.deleteCAdjustment);
  const settings = useSettingsStore();

  const [expandedDay, setExpandedDay] = useState(null);
  const [showAddCA, setShowAddCA] = useState(false);
  const [caAmount, setCAAmount] = useState('');
  const [caNote, setCANote] = useState('');
  const [deleteAdjustmentId, setDeleteAdjustmentId] = useState(null);

  // Aggregate week data
  const weekData = aggregateEntriesForWeek(entries, caAdjustments, settings);

  // Find max earnings for chart scaling
  const maxDayEarnings = Math.max(
    ...weekData.dailyBreakdown.map((d) => d.gross),
    1 // Prevent division by zero
  );

  const toggleDay = (date) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  // Get CA adjustments for this week
  const weekCAdjustments = caAdjustments.filter((adj) => {
    return adj.date >= weekData.startDate && adj.date <= weekData.endDate;
  });

  const handleAddCAdjustment = () => {
    const amount = parseFloat(caAmount);
    if (!amount || amount <= 0) return;

    addCAdjustment({
      date: new Date().toISOString().split('T')[0],
      amount,
      note: caNote.trim() || 'CA Prop 22 Adjustment',
    });

    setCAAmount('');
    setCANote('');
    setShowAddCA(false);
  };

  const handleDeleteCAdjustment = () => {
    if (deleteAdjustmentId) {
      deleteCAdjustment(deleteAdjustmentId);
      setDeleteAdjustmentId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.pageTitle}>This Week</Text>
        <Text style={styles.dateRange}>
          {new Date(weekData.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(weekData.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Week Take-Home</Text>
          <Text style={styles.heroAmount}>{formatCurrency(weekData.takeHome)}</Text>
          <Text style={styles.heroSubtext}>
            {weekData.entryCount} {weekData.entryCount === 1 ? 'trip' : 'trips'} •{' '}
            {formatHours(weekData.hours)}
          </Text>
        </View>

        {/* Week Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {weekData.dailyBreakdown.slice().reverse().map((day, index) => {
              const dayDate = new Date(day.date + 'T00:00:00');
              const dayName = DAYS[dayDate.getDay()];
              const barHeight = day.gross > 0 ? (day.gross / maxDayEarnings) * 80 : 4;

              return (
                <View key={day.date} style={styles.chartBarContainer}>
                  <Text style={styles.chartBarAmount}>
                    {day.gross > 0 ? `$${Math.round(day.gross)}` : ''}
                  </Text>
                  <View
                    style={[
                      styles.chartBar,
                      { height: barHeight },
                      day.gross === 0 && styles.chartBarEmpty,
                    ]}
                  />
                  <Text style={styles.chartBarLabel}>{dayName}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gross</Text>
            <Text style={styles.statValue}>{formatCurrency(weekData.gross)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg/Day</Text>
            <Text style={styles.statValue}>
              {formatCurrency(weekData.gross / 7)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>True Hourly</Text>
            <Text style={styles.statValue}>
              {weekData.hours > 0
                ? `${formatCurrency(weekData.trueHourly)}/hr`
                : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Set Aside</Text>
            <Text style={[styles.statValue, styles.statValueRed]}>
              {formatCurrency(weekData.setAside)}
            </Text>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Pay</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(weekData.basePay)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tips</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(weekData.tips)}</Text>
          </View>
          {weekData.caAdjustments > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>CA Adjustments</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(weekData.caAdjustments)}
              </Text>
            </View>
          )}
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabelBold}>Gross Earnings</Text>
            <Text style={styles.breakdownValueBold}>{formatCurrency(weekData.gross)}</Text>
          </View>
        </View>

        {/* CA Prop 22 Adjustments Section */}
        {settings.californiaMode && (
          <View style={styles.caSection}>
            <View style={styles.caSectionHeader}>
              <Text style={styles.sectionTitle}>CA Prop 22 Adjustments</Text>
              <TouchableOpacity
                style={styles.addCAButton}
                onPress={() => setShowAddCA(!showAddCA)}
                activeOpacity={0.7}
              >
                <Plus color="#3B82F6" size={20} />
                <Text style={styles.addCAButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Info text */}
            <Text style={styles.caInfoText}>
              Log your weekly Prop 22 healthcare stipends and guaranteed earnings adjustments here.
            </Text>

            {/* Inline Add Form */}
            {showAddCA && (
              <View style={styles.caAddForm}>
                <View style={styles.caInputRow}>
                  <View style={styles.caInputWrapper}>
                    <Text style={styles.caInputLabel}>Amount</Text>
                    <View style={styles.caInputContainer}>
                      <Text style={styles.caInputPrefix}>$</Text>
                      <TextInput
                        style={styles.caInput}
                        value={caAmount}
                        onChangeText={setCAAmount}
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={[styles.caInputWrapper, styles.caInputWrapperFlex]}>
                    <Text style={styles.caInputLabel}>Note (optional)</Text>
                    <TextInput
                      style={styles.caInputNote}
                      value={caNote}
                      onChangeText={setCANote}
                      placeholder="e.g. Healthcare stipend"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.caFormButtons}>
                  <TouchableOpacity
                    style={styles.caCancelButton}
                    onPress={() => {
                      setShowAddCA(false);
                      setCAAmount('');
                      setCANote('');
                    }}
                  >
                    <Text style={styles.caCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.caSaveButton, !caAmount && styles.caSaveButtonDisabled]}
                    onPress={handleAddCAdjustment}
                    disabled={!caAmount}
                  >
                    <Text style={styles.caSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* List of adjustments */}
            {weekCAdjustments.length > 0 ? (
              <View style={styles.caList}>
                {weekCAdjustments.map((adj) => (
                  <View key={adj.id} style={styles.caItem}>
                    <View style={styles.caItemLeft}>
                      <Text style={styles.caItemNote}>{adj.note}</Text>
                      <Text style={styles.caItemDate}>
                        {new Date(adj.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.caItemRight}>
                      <Text style={styles.caItemAmount}>{formatCurrency(adj.amount)}</Text>
                      <TouchableOpacity
                        style={styles.caDeleteButton}
                        onPress={() => setDeleteAdjustmentId(adj.id)}
                      >
                        <Trash2 color="#EF4444" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.caEmptyState}>
                <Text style={styles.caEmptyText}>No adjustments this week</Text>
              </View>
            )}
          </View>
        )}

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        {weekData.dailyBreakdown.map((day) => {
          const dayDate = new Date(day.date + 'T00:00:00');
          const isToday = day.date === new Date().toISOString().split('T')[0];
          const isExpanded = expandedDay === day.date;

          return (
            <TouchableOpacity
              key={day.date}
              style={styles.dayCard}
              onPress={() => toggleDay(day.date)}
              activeOpacity={0.7}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayLeft}>
                  <Text style={styles.dayName}>
                    {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    {isToday && <Text style={styles.todayBadge}> Today</Text>}
                  </Text>
                  <Text style={styles.dayDate}>
                    {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.dayRight}>
                  <Text style={styles.dayAmount}>
                    {day.entryCount > 0 ? formatCurrency(day.gross) : '—'}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp color="#9CA3AF" size={20} />
                  ) : (
                    <ChevronDown color="#9CA3AF" size={20} />
                  )}
                </View>
              </View>

              {isExpanded && day.entryCount > 0 && (
                <View style={styles.dayDetails}>
                  <View style={styles.dayDetailRow}>
                    <Text style={styles.dayDetailLabel}>Trips</Text>
                    <Text style={styles.dayDetailValue}>{day.entryCount}</Text>
                  </View>
                  <View style={styles.dayDetailRow}>
                    <Text style={styles.dayDetailLabel}>Miles</Text>
                    <Text style={styles.dayDetailValue}>{day.miles.toFixed(1)}</Text>
                  </View>
                  <View style={styles.dayDetailRow}>
                    <Text style={styles.dayDetailLabel}>Time</Text>
                    <Text style={styles.dayDetailValue}>{formatHours(day.hours)}</Text>
                  </View>
                  <View style={styles.dayDetailRow}>
                    <Text style={styles.dayDetailLabel}>Take-Home</Text>
                    <Text style={[styles.dayDetailValue, styles.dayDetailValueGreen]}>
                      {formatCurrency(day.takeHome)}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteAdjustmentId}
        title="Delete Adjustment"
        message="Are you sure you want to delete this CA adjustment?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCAdjustment}
        onCancel={() => setDeleteAdjustmentId(null)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  dateRange: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 44,
    fontWeight: '700',
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  heroSubtext: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarAmount: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  chartBar: {
    width: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarEmpty: {
    backgroundColor: '#E5E7EB',
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  statValueRed: {
    color: '#DC2626',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  breakdownLabelBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownValueBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLeft: {},
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  todayBadge: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  dayDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dayDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dayDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  dayDetailValueGreen: {
    color: '#059669',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  // CA Prop 22 Styles
  caSection: {
    marginBottom: 24,
  },
  caSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addCAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  addCAButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  caInfoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  caAddForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  caInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  caInputWrapper: {
    width: 100,
  },
  caInputWrapperFlex: {
    flex: 1,
    width: 'auto',
  },
  caInputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  caInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  caInputPrefix: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  caInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  caInputNote: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#111827',
  },
  caFormButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  caCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  caCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  caSaveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  caSaveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  caSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  caList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  caItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  caItemLeft: {},
  caItemNote: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  caItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  caItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  caDeleteButton: {
    padding: 4,
  },
  caEmptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  caEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
