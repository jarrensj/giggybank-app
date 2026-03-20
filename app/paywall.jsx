import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';

import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkSubscriptionStatus,
} from '../src/services/revenuecat';
import { useSettingsStore } from '../src/stores/settingsStore';

const FEATURES = [
  'Track unlimited trips and earnings',
  'See your true hourly rate after expenses',
  'Automatic tax set-aside calculations',
  'Monthly PDF tax reports',
  'Mileage deduction tracking (IRS rates)',
  'CA Prop 22 adjustment support',
  'Export data as CSV backup',
  '100% offline - your data stays private',
];

export default function PaywallScreen() {
  const router = useRouter();
  const setSubscribed = useSettingsStore((state) => state.setSubscribed);

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    const current = await getOfferings();
    setOfferings(current);
    if (current?.availablePackages?.length > 0) {
      setSelectedPackage(current.availablePackages[0]);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan.');
      return;
    }

    setPurchasing(true);
    const result = await purchasePackage(selectedPackage);
    setPurchasing(false);

    if (result.success) {
      setSubscribed(true);
      router.replace('/(tabs)/today');
    } else if (result.cancelled) {
      // User cancelled, do nothing
    } else {
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const result = await restorePurchases();
    setPurchasing(false);

    if (result.success) {
      setSubscribed(true);
      Alert.alert('Restored!', 'Your subscription has been restored.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/today') },
      ]);
    } else {
      Alert.alert('No Subscription Found', 'No previous subscription was found for this account.');
    }
  };

  const formatPrice = (pkg) => {
    if (!pkg?.product) return '';
    const { priceString, subscriptionPeriod } = pkg.product;

    if (subscriptionPeriod === 'P1M') {
      return `${priceString}/month`;
    } else if (subscriptionPeriod === 'P1Y') {
      return `${priceString}/year`;
    } else if (subscriptionPeriod === 'P1W') {
      return `${priceString}/week`;
    }
    return priceString;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles color="#059669" size={32} />
          </View>
          <Text style={styles.title}>Unlock Giggy Bank</Text>
          <Text style={styles.subtitle}>
            Take control of your gig earnings with powerful tracking and tax tools
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check color="#059669" size={18} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : offerings?.availablePackages ? (
          <View style={styles.packagesSection}>
            {offerings.availablePackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageCard,
                  selectedPackage?.identifier === pkg.identifier && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.7}
              >
                <View style={styles.packageRadio}>
                  {selectedPackage?.identifier === pkg.identifier && (
                    <View style={styles.packageRadioInner} />
                  )}
                </View>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                  <Text style={styles.packagePrice}>{formatPrice(pkg)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load subscription plans.</Text>
            <TouchableOpacity onPress={loadOfferings} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.subscribeButton, purchasing && styles.subscribeButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage}
          activeOpacity={0.8}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={purchasing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Payment will be charged to your App Store account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  packagesSection: {
    gap: 12,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  packageCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  packageRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  subscribeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 15,
    color: '#3B82F6',
  },
  termsText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});
