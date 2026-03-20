import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';

import { useEntriesStore } from '../../../src/stores/entriesStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import {
  aggregateEntriesForDay,
  formatCurrency,
  formatHours,
} from '../../../src/utils/calculations';
import ConfirmDialog from '../../../src/components/ConfirmDialog';

export default function TodayScreen() {
  const router = useRouter();
  const entries = useEntriesStore((state) => state.entries);
  const platforms = useEntriesStore((state) => state.platforms);
  const deleteEntry = useEntriesStore((state) => state.deleteEntry);
  const settings = useSettingsStore();

  const [deleteId, setDeleteId] = React.useState(null);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Aggregate today's data
  const todayData = aggregateEntriesForDay(entries, today, settings);

  const getPlatformName = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform?.name || 'Unknown';
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteEntry(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Today</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Hero Card - Take Home */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today's Take-Home</Text>
          <Text style={styles.heroAmount}>{formatCurrency(todayData.takeHome)}</Text>
          {todayData.entryCount > 0 && (
            <Text style={styles.heroSubtext}>
              from {formatCurrency(todayData.gross)} gross
            </Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gross</Text>
            <Text style={styles.statValue}>{formatCurrency(todayData.gross)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>True Hourly</Text>
            <Text style={styles.statValue}>
              {todayData.hours > 0
                ? `${formatCurrency(todayData.trueHourly)}/hr`
                : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Set Aside</Text>
            <Text style={[styles.statValue, styles.statValueRed]}>
              {formatCurrency(todayData.setAside)}
            </Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{todayData.entryCount}</Text>
            <Text style={styles.quickStatLabel}>
              {todayData.entryCount === 1 ? 'Trip' : 'Trips'}
            </Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{todayData.miles.toFixed(1)}</Text>
            <Text style={styles.quickStatLabel}>Miles</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{formatHours(todayData.hours)}</Text>
            <Text style={styles.quickStatLabel}>Time</Text>
          </View>
        </View>

        {/* Add Buttons */}
        <View style={styles.addButtonsRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-trip')}
            activeOpacity={0.7}
          >
            <Plus color="#3B82F6" size={20} />
            <Text style={styles.addButtonText}>Add Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-day-total')}
            activeOpacity={0.7}
          >
            <Plus color="#3B82F6" size={20} />
            <Text style={styles.addButtonText}>Add Day Total</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>

          {todayData.entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No entries yet today</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first trip
              </Text>
            </View>
          ) : (
            todayData.entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => router.push(`/edit-entry?id=${entry.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.entryMain}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryPlatform}>
                      {getPlatformName(entry.platformId)}
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
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetail}>{entry.miles.toFixed(1)} mi</Text>
                    <Text style={styles.entryDetailDot}>•</Text>
                    <Text style={styles.entryDetail}>{formatHours(entry.hours)}</Text>
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
            ))
          )}
        </View>

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
  },
  dateText: {
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
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  entriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
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
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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
  entryPlatform: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  entryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  entryDetailDot: {
    fontSize: 14,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  entryAmount: {
    fontSize: 18,
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
});
