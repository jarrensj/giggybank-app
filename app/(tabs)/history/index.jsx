import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';

import { useEntriesStore } from '../../../src/stores/entriesStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import {
  formatCurrency,
  formatHours,
  calculateTakeHome,
} from '../../../src/utils/calculations';
import ConfirmDialog from '../../../src/components/ConfirmDialog';

// Get start of week (Sunday)
function getWeekStart(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  return weekStart.toISOString().split('T')[0];
}

// Group entries by week
function groupEntriesByWeek(entries) {
  const groups = {};

  entries.forEach((entry) => {
    const weekStart = getWeekStart(entry.date);
    if (!groups[weekStart]) {
      groups[weekStart] = [];
    }
    groups[weekStart].push(entry);
  });

  // Sort weeks (most recent first) and entries within each week
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, weekEntries]) => ({
      weekStart,
      entries: weekEntries.sort((a, b) => b.date.localeCompare(a.date)),
    }));
}

export default function HistoryScreen() {
  const router = useRouter();
  const entries = useEntriesStore((state) => state.entries);
  const platforms = useEntriesStore((state) => state.platforms);
  const deleteEntry = useEntriesStore((state) => state.deleteEntry);
  const settings = useSettingsStore();

  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Filter entries by platform
  const filteredEntries = useMemo(() => {
    if (selectedPlatform === 'all') return entries;
    return entries.filter((e) => e.platformId === selectedPlatform);
  }, [entries, selectedPlatform]);

  // Group filtered entries by week
  const groupedEntries = useMemo(() => {
    return groupEntriesByWeek(filteredEntries);
  }, [filteredEntries]);

  // Get used platforms (platforms that have entries)
  const usedPlatforms = useMemo(() => {
    const usedIds = new Set(entries.map((e) => e.platformId));
    return platforms.filter((p) => usedIds.has(p.id));
  }, [entries, platforms]);

  // Calculate platform breakdown analytics
  const platformBreakdown = useMemo(() => {
    if (entries.length === 0) return [];

    const breakdown = {};
    let totalEarnings = 0;

    entries.forEach((entry) => {
      if (!breakdown[entry.platformId]) {
        breakdown[entry.platformId] = {
          platformId: entry.platformId,
          earnings: 0,
          trips: 0,
          hours: 0,
          miles: 0,
        };
      }
      breakdown[entry.platformId].earnings += entry.earnings || 0;
      breakdown[entry.platformId].trips += 1;
      breakdown[entry.platformId].hours += entry.hours || 0;
      breakdown[entry.platformId].miles += entry.miles || 0;
      totalEarnings += entry.earnings || 0;
    });

    // Convert to array, calculate percentages, and sort by earnings
    return Object.values(breakdown)
      .map((item) => ({
        ...item,
        name: getPlatformName(item.platformId),
        percentage: totalEarnings > 0 ? (item.earnings / totalEarnings) * 100 : 0,
      }))
      .sort((a, b) => b.earnings - a.earnings);
  }, [entries, platforms]);

  const getPlatformName = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform?.name || 'Unknown';
  };

  const toggleWeek = (weekStart) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekStart]: !prev[weekStart],
    }));
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteEntry(deleteId);
      setDeleteId(null);
    }
  };

  const calculateWeekTotal = (weekEntries) => {
    const gross = weekEntries.reduce((sum, e) => sum + (e.earnings || 0), 0);
    const miles = weekEntries.reduce((sum, e) => sum + (e.miles || 0), 0);
    const hours = weekEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
    const takeHome = calculateTakeHome(gross, miles, hours, settings);
    return { gross, miles, hours, takeHome, count: weekEntries.length };
  };

  const formatWeekRange = (weekStart) => {
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // Check if this is current week
    const today = new Date();
    const todayWeekStart = getWeekStart(today.toISOString().split('T')[0]);
    if (weekStart === todayWeekStart) {
      return 'This Week';
    }

    // Check if last week
    const lastWeekStart = new Date(todayWeekStart + 'T00:00:00');
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    if (weekStart === lastWeekStart.toISOString().split('T')[0]) {
      return 'Last Week';
    }

    return `${startStr} - ${endStr}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>History</Text>

        {/* Platform Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPlatform === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedPlatform('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPlatform === 'all' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {usedPlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.filterChip,
                selectedPlatform === platform.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedPlatform(platform.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedPlatform === platform.id && styles.filterChipTextActive,
                ]}
              >
                {platform.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Stats */}
        {filteredEntries.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{filteredEntries.length}</Text>
                <Text style={styles.summaryLabel}>
                  {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    filteredEntries.reduce((sum, e) => sum + (e.earnings || 0), 0)
                  )}
                </Text>
                <Text style={styles.summaryLabel}>Total Gross</Text>
              </View>
            </View>
          </View>
        )}

        {/* Platform Analytics */}
        {entries.length > 0 && platformBreakdown.length > 1 && (
          <View style={styles.analyticsSection}>
            <TouchableOpacity
              style={styles.analyticsHeader}
              onPress={() => setShowAnalytics(!showAnalytics)}
              activeOpacity={0.7}
            >
              <Text style={styles.analyticsSectionTitle}>Platform Breakdown</Text>
              {showAnalytics ? (
                <ChevronUp color="#9CA3AF" size={20} />
              ) : (
                <ChevronDown color="#9CA3AF" size={20} />
              )}
            </TouchableOpacity>

            {showAnalytics && (
              <View style={styles.analyticsCard}>
                {platformBreakdown.map((platform, index) => (
                  <View
                    key={platform.platformId}
                    style={[
                      styles.platformRow,
                      index < platformBreakdown.length - 1 && styles.platformRowBorder,
                    ]}
                  >
                    <View style={styles.platformInfo}>
                      <View style={styles.platformNameRow}>
                        <Text style={styles.platformName}>{platform.name}</Text>
                        <Text style={styles.platformPercentage}>
                          {platform.percentage.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${Math.max(platform.percentage, 2)}%` },
                          ]}
                        />
                      </View>
                      <View style={styles.platformStats}>
                        <Text style={styles.platformStat}>
                          {platform.trips} {platform.trips === 1 ? 'trip' : 'trips'}
                        </Text>
                        <Text style={styles.platformStatDot}>•</Text>
                        <Text style={styles.platformStat}>
                          {platform.miles.toFixed(1)} mi
                        </Text>
                        <Text style={styles.platformStatDot}>•</Text>
                        <Text style={styles.platformStat}>
                          {formatHours(platform.hours)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.platformEarnings}>
                      {formatCurrency(platform.earnings)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Grouped Entries */}
        {groupedEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No entries yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your past entries will appear here
            </Text>
          </View>
        ) : (
          groupedEntries.map(({ weekStart, entries: weekEntries }) => {
            const isExpanded = expandedWeeks[weekStart] !== false; // Default expanded
            const weekTotal = calculateWeekTotal(weekEntries);

            return (
              <View key={weekStart} style={styles.weekSection}>
                {/* Week Header */}
                <TouchableOpacity
                  style={styles.weekHeader}
                  onPress={() => toggleWeek(weekStart)}
                  activeOpacity={0.7}
                >
                  <View style={styles.weekHeaderLeft}>
                    <Text style={styles.weekTitle}>{formatWeekRange(weekStart)}</Text>
                    <Text style={styles.weekSubtitle}>
                      {weekTotal.count} {weekTotal.count === 1 ? 'entry' : 'entries'} •{' '}
                      {formatCurrency(weekTotal.gross)}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp color="#9CA3AF" size={20} />
                  ) : (
                    <ChevronDown color="#9CA3AF" size={20} />
                  )}
                </TouchableOpacity>

                {/* Week Entries */}
                {isExpanded && (
                  <View style={styles.weekEntries}>
                    {weekEntries.map((entry) => {
                      const entryDate = new Date(entry.date + 'T00:00:00');
                      const isToday =
                        entry.date === new Date().toISOString().split('T')[0];

                      return (
                        <TouchableOpacity
                          key={entry.id}
                          style={styles.entryCard}
                          onPress={() => router.push(`/edit-entry?id=${entry.id}`)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.entryMain}>
                            <View style={styles.entryHeader}>
                              <Text style={styles.entryDate}>
                                {entryDate.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                {isToday && <Text style={styles.todayBadge}> Today</Text>}
                              </Text>
                              <View
                                style={[
                                  styles.entryBadge,
                                  entry.entryType === 'trip'
                                    ? styles.entryBadgeTrip
                                    : styles.entryBadgeDayTotal,
                                ]}
                              >
                                <Text style={styles.entryBadgeText}>
                                  {entry.entryType === 'trip' ? 'Trip' : 'Day'}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.entryPlatform}>
                              {getPlatformName(entry.platformId)}
                            </Text>
                            <View style={styles.entryDetails}>
                              <Text style={styles.entryDetail}>
                                {entry.miles?.toFixed(1) || 0} mi
                              </Text>
                              <Text style={styles.entryDetailDot}>•</Text>
                              <Text style={styles.entryDetail}>
                                {formatHours(entry.hours || 0)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.entryRight}>
                            <Text style={styles.entryAmount}>
                              {formatCurrency(entry.earnings)}
                            </Text>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                setDeleteId(entry.id);
                              }}
                            >
                              <Trash2 color="#EF4444" size={18} />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
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
    marginBottom: 16,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  weekSection: {
    marginBottom: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  weekHeaderLeft: {},
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  weekSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  weekEntries: {
    gap: 10,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entryMain: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  todayBadge: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  entryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryBadgeTrip: {
    backgroundColor: '#DBEAFE',
  },
  entryBadgeDayTotal: {
    backgroundColor: '#FEF3C7',
  },
  entryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  entryPlatform: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  entryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  entryDetailDot: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  entryAmount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    padding: 4,
  },
  bottomSpacer: {
    height: 40,
  },
  // Analytics styles
  analyticsSection: {
    marginBottom: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  platformRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  platformInfo: {
    flex: 1,
  },
  platformNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  platformName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  platformPercentage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  platformStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  platformStatDot: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  platformEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    fontVariant: ['tabular-nums'],
    marginLeft: 12,
  },
});
