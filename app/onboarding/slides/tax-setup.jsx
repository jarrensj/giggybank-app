import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Calculator } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { useSettingsStore } from '../../../src/stores/settingsStore';

export default function TaxSetupSlide() {
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const handleTaxRateChange = (value) => {
    updateSetting('taxRate', Math.round(value));
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Calculator color="#8B5CF6" size={48} />
      </View>
      <Text style={styles.title}>Set Up Your Taxes</Text>
      <Text style={styles.subtitle}>Customize for your situation</Text>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Tax Rate</Text>
            <Text style={styles.settingValue}>{settings.taxRate}%</Text>
          </View>
          <Text style={styles.settingDescription}>
            Percentage set aside for income taxes
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={50}
            step={1}
            value={settings.taxRate}
            onValueChange={handleTaxRateChange}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#8B5CF6"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.settingLabel}>Self-Employment Tax</Text>
            <Text style={styles.settingDescription}>
              Add 15.3% SE tax (most gig workers)
            </Text>
          </View>
          <Switch
            value={settings.includeSelfEmploymentTax}
            onValueChange={(value) => updateSetting('includeSelfEmploymentTax', value)}
            trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
            thumbColor={settings.includeSelfEmploymentTax ? '#8B5CF6' : '#FFFFFF'}
          />
        </View>
      </View>

      <Text style={styles.description}>
        Don't worry - you can change these anytime in Settings.
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
    backgroundColor: '#EDE9FE',
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
  settingsCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  settingRow: {
    marginBottom: 8,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
