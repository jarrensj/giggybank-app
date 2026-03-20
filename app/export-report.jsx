import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useEntriesStore } from '../src/stores/entriesStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import {
  formatCurrency,
  formatHours,
  aggregateEntriesForMonth,
} from '../src/utils/calculations';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ExportReportScreen() {
  const router = useRouter();
  const entries = useEntriesStore((state) => state.entries);
  const platforms = useEntriesStore((state) => state.platforms);
  const settings = useSettingsStore();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  // Get data for selected month
  const monthData = useMemo(() => {
    return aggregateEntriesForMonth(
      entries,
      [],
      settings,
      selectedYear,
      selectedMonth
    );
  }, [entries, settings, selectedYear, selectedMonth]);

  const changeMonth = (delta) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const generatePDF = async () => {
    try {
      const monthName = MONTHS[selectedMonth];

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111827; }
            h1 { color: #059669; margin-bottom: 8px; }
            .subtitle { color: #6B7280; margin-bottom: 32px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: 600; color: #6B7280; text-transform: uppercase; margin-bottom: 12px; }
            .card { background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; }
            .label { color: #6B7280; }
            .value { font-weight: 600; }
            .value-green { color: #059669; }
            .value-red { color: #DC2626; }
            .divider { height: 1px; background: #E5E7EB; margin: 16px 0; }
            .hero { background: #ECFDF5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
            .hero-label { color: #059669; font-size: 14px; }
            .hero-amount { color: #059669; font-size: 36px; font-weight: 700; }
            .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Giggy Bank Tax Report</h1>
          <p class="subtitle">${monthName} ${selectedYear}</p>

          <div class="hero">
            <div class="hero-label">Take-Home Earnings</div>
            <div class="hero-amount">${formatCurrency(monthData.takeHome)}</div>
          </div>

          <div class="section">
            <div class="section-title">Summary</div>
            <div class="card">
              <div class="row">
                <span class="label">Total Entries</span>
                <span class="value">${monthData.entryCount}</span>
              </div>
              <div class="row">
                <span class="label">Total Miles</span>
                <span class="value">${monthData.miles.toFixed(1)}</span>
              </div>
              <div class="row">
                <span class="label">Total Hours</span>
                <span class="value">${formatHours(monthData.hours)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Earnings</div>
            <div class="card">
              <div class="row">
                <span class="label">Base Pay</span>
                <span class="value">${formatCurrency(monthData.basePay)}</span>
              </div>
              <div class="row">
                <span class="label">Tips</span>
                <span class="value">${formatCurrency(monthData.tips)}</span>
              </div>
              <div class="divider"></div>
              <div class="row">
                <span class="label"><strong>Gross Earnings</strong></span>
                <span class="value"><strong>${formatCurrency(monthData.gross)}</strong></span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Deductions</div>
            <div class="card">
              <div class="row">
                <span class="label">Mileage Deduction (${monthData.miles.toFixed(1)} mi × $${settings.mileageRate})</span>
                <span class="value value-red">${formatCurrency(monthData.miles * settings.mileageRate)}</span>
              </div>
              <div class="row">
                <span class="label">Estimated Taxes</span>
                <span class="value value-red">${formatCurrency(monthData.setAside)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Key Metrics</div>
            <div class="card">
              <div class="row">
                <span class="label">True Hourly Rate</span>
                <span class="value value-green">${monthData.hours > 0 ? formatCurrency(monthData.trueHourly) + '/hr' : '—'}</span>
              </div>
              <div class="row">
                <span class="label">Tax Set-Aside</span>
                <span class="value value-red">${formatCurrency(monthData.setAside)}</span>
              </div>
              <div class="row">
                <span class="label">Take-Home</span>
                <span class="value value-green">${formatCurrency(monthData.takeHome)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Generated by Giggy Bank on ${new Date().toLocaleDateString()}
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${monthName} ${selectedYear} Tax Report`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to generate PDF report.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#6B7280" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Report</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => changeMonth(-1)}
          >
            <ChevronLeft color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => changeMonth(1)}
          >
            <ChevronRight color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <View style={styles.heroPreview}>
            <Text style={styles.heroLabel}>Take-Home</Text>
            <Text style={styles.heroAmount}>{formatCurrency(monthData.takeHome)}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthData.entryCount}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthData.miles.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatHours(monthData.hours)}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>

          <View style={styles.breakdownSection}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Gross Earnings</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(monthData.gross)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Mileage Deduction</Text>
              <Text style={[styles.breakdownValue, styles.valueRed]}>
                -{formatCurrency(monthData.miles * settings.mileageRate)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax Set-Aside</Text>
              <Text style={[styles.breakdownValue, styles.valueRed]}>
                -{formatCurrency(monthData.setAside)}
              </Text>
            </View>
          </View>
        </View>

        {monthData.entryCount === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No entries for this month</Text>
          </View>
        )}
      </ScrollView>

      {/* Export Button */}
      <View style={styles.footer}>
        <Text style={styles.disclaimerText}>
          Not tax advice. Consult a tax professional.
        </Text>
        <TouchableOpacity
          style={[styles.exportButton, monthData.entryCount === 0 && styles.exportButtonDisabled]}
          onPress={generatePDF}
          disabled={monthData.entryCount === 0}
          activeOpacity={0.8}
        >
          <FileText color="#FFFFFF" size={20} />
          <Text style={styles.exportButtonText}>Export PDF Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 24,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  heroPreview: {
    backgroundColor: '#ECFDF5',
    padding: 24,
    alignItems: 'center',
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
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  breakdownSection: {
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  valueRed: {
    color: '#DC2626',
  },
  emptyState: {
    marginTop: 24,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  exportButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
});
