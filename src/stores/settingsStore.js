import { create } from 'zustand';
import { saveData, loadData, STORAGE_KEYS } from '../utils/storage';

// 2025 IRS standard mileage rate
const DEFAULT_MILEAGE_RATE = 0.67;
const DEFAULT_VEHICLE_WEAR = 0.15;
const DEFAULT_TAX_RATE = 25;

const initialState = {
  // Tax settings
  taxRate: DEFAULT_TAX_RATE,
  includeSelfEmploymentTax: true,

  // Mileage settings
  mileageRate: DEFAULT_MILEAGE_RATE,
  includeVehicleWear: true,
  vehicleWearPerMile: DEFAULT_VEHICLE_WEAR,

  // California Prop 22
  californiaMode: false,

  // App state
  onboardingComplete: false,

  // Theme
  theme: 'system', // 'light', 'dark', 'system'

  // Hydration state
  _hasHydrated: false,
};

export const useSettingsStore = create((set, get) => ({
  ...initialState,

  // Setters
  setTaxRate: (taxRate) => {
    set({ taxRate });
    get()._persist();
  },

  setIncludeSelfEmploymentTax: (includeSelfEmploymentTax) => {
    set({ includeSelfEmploymentTax });
    get()._persist();
  },

  setMileageRate: (mileageRate) => {
    set({ mileageRate });
    get()._persist();
  },

  setIncludeVehicleWear: (includeVehicleWear) => {
    set({ includeVehicleWear });
    get()._persist();
  },

  setVehicleWearPerMile: (vehicleWearPerMile) => {
    set({ vehicleWearPerMile });
    get()._persist();
  },

  setCaliforniaMode: (californiaMode) => {
    set({ californiaMode });
    get()._persist();
  },

  setOnboardingComplete: (onboardingComplete) => {
    set({ onboardingComplete });
    get()._persist();
  },

  setTheme: (theme) => {
    set({ theme });
    get()._persist();
  },

  // Reset to defaults
  resetSettings: () => {
    set({
      taxRate: DEFAULT_TAX_RATE,
      includeSelfEmploymentTax: true,
      mileageRate: DEFAULT_MILEAGE_RATE,
      includeVehicleWear: true,
      vehicleWearPerMile: DEFAULT_VEHICLE_WEAR,
      californiaMode: false,
      theme: 'system',
    });
    get()._persist();
  },

  // Persistence
  _persist: async () => {
    const state = get();
    const dataToSave = {
      taxRate: state.taxRate,
      includeSelfEmploymentTax: state.includeSelfEmploymentTax,
      mileageRate: state.mileageRate,
      includeVehicleWear: state.includeVehicleWear,
      vehicleWearPerMile: state.vehicleWearPerMile,
      californiaMode: state.californiaMode,
      onboardingComplete: state.onboardingComplete,
      theme: state.theme,
    };
    await saveData(STORAGE_KEYS.SETTINGS, dataToSave);
  },

  // Hydration (load from storage on app start)
  hydrate: async () => {
    const savedData = await loadData(STORAGE_KEYS.SETTINGS);
    if (savedData) {
      set({
        ...savedData,
        _hasHydrated: true,
      });
    } else {
      set({ _hasHydrated: true });
    }
  },
}));
