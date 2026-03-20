import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { useEntriesStore } from '../../../src/stores/entriesStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import {
  aggregateEntriesForWeek,
  formatCurrency,
  formatHours,
} from '../../../src/utils/calculations';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekScreen() {
  const entries = useEntriesStore((state) => state.entries);
  const caAdjustments = useEntriesStore((state) => state.caAdjustments);
  const settings = useSettingsStore();

  const [expandedDay, setExpandedDay] = useState(null);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
});
