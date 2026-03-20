import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store (will be JSON stringified)
 */
export async function saveData(key, data) {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
    throw error;
  }
}

/**
 * Load data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} Parsed data or defaultValue
 */
export async function loadData(key, defaultValue = null) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      return defaultValue;
    }
    return JSON.parse(jsonValue);
  } catch (error) {
    console.error(`Error loading data for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key to remove
 */
export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    throw error;
  }
}

/**
 * Clear all app data from AsyncStorage
 */
export async function clearAllData() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  SETTINGS: 'giggybank_settings',
  ENTRIES: 'giggybank_entries',
  PLATFORMS: 'giggybank_platforms',
  CA_ADJUSTMENTS: 'giggybank_ca_adjustments',
  ONBOARDING_COMPLETE: 'giggybank_onboarding_complete',
};
