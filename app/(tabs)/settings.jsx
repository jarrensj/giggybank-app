import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettingsStore } from '../../src/stores/settingsStore';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Tax Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Settings</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Tax Rate</Text>
                <Text style={styles.settingDescription}>
                  Percentage set aside for taxes
                </Text>
              </View>
              <Text style={styles.settingValue}>{settings.taxRate}%</Text>
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Self-Employment Tax</Text>
                <Text style={styles.settingDescription}>
                  Include 15.3% SE tax in calculations
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {settings.includeSelfEmploymentTax ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </View>

        {/* Mileage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mileage</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>IRS Mileage Rate</Text>
                <Text style={styles.settingDescription}>
                  Standard deduction per mile
                </Text>
              </View>
              <Text style={styles.settingValue}>${settings.mileageRate}/mi</Text>
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Vehicle Wear</Text>
                <Text style={styles.settingDescription}>
                  Additional wear cost per mile
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {settings.includeVehicleWear
                  ? `$${settings.vehicleWearPerMile}/mi`
                  : 'OFF'}
              </Text>
            </View>
          </View>
        </View>

        {/* California Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>California</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Prop 22 Mode</Text>
                <Text style={styles.settingDescription}>
                  Track CA guaranteed earnings adjustments
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {settings.californiaMode ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.placeholderText}>
              Export and backup options coming soon
            </Text>
          </View>
        </View>

        {/* Danger Zone Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>
            Danger Zone
          </Text>
          <View style={[styles.sectionCard, styles.sectionCardDanger]}>
            <Text style={styles.placeholderText}>
              Clear all data option coming soon
            </Text>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValueMuted}>v1.0.0-beta</Text>
            </View>
          </View>
        </View>

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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitleDanger: {
    color: '#DC2626',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionCardDanger: {
    borderColor: '#FECACA',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  settingValueMuted: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    padding: 16,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
