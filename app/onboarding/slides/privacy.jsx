import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Smartphone, WifiOff } from 'lucide-react-native';

export default function PrivacySlide() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Shield color="#059669" size={48} />
      </View>
      <Text style={styles.title}>Your Data Stays Private</Text>
      <Text style={styles.subtitle}>100% offline and secure</Text>

      <View style={styles.featuresCard}>
        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Smartphone color="#059669" size={24} />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>On Your Device Only</Text>
            <Text style={styles.featureDescription}>
              All data is stored locally on your phone
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <WifiOff color="#059669" size={24} />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>No Internet Required</Text>
            <Text style={styles.featureDescription}>
              Works completely offline, no server sync
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Shield color="#059669" size={24} />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>No Account Needed</Text>
            <Text style={styles.featureDescription}>
              No sign-up, no tracking, no ads
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>
        Export your data anytime as CSV or JSON backup.
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
    backgroundColor: '#ECFDF5',
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
  featuresCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
