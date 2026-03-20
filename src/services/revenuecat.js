import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
  REVENUECAT_APPLE_API_KEY,
  REVENUECAT_GOOGLE_API_KEY,
  REVENUECAT_ENTITLEMENT_ID,
} from '@env';

const API_KEY = Platform.select({
  ios: REVENUECAT_APPLE_API_KEY,
  android: REVENUECAT_GOOGLE_API_KEY,
});

const ENTITLEMENT_ID = REVENUECAT_ENTITLEMENT_ID || 'premium';

export async function initializeRevenueCat() {
  if (!API_KEY) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    await Purchases.configure({ apiKey: API_KEY });
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

export async function checkSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isSubscribed =
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return isSubscribed;
  } catch (error) {
    console.error('Failed to check subscription:', error);
    return false;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

export async function purchasePackage(pkg) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isSubscribed =
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return { success: isSubscribed, customerInfo };
  } catch (error) {
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    console.error('Purchase failed:', error);
    return { success: false, error };
  }
}

export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isSubscribed =
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return { success: isSubscribed, customerInfo };
  } catch (error) {
    console.error('Restore failed:', error);
    return { success: false, error };
  }
}
