import { create } from 'zustand';
import { saveData, loadData, STORAGE_KEYS } from '../utils/storage';

// Default gig platforms
const DEFAULT_PLATFORMS = [
  { id: 'uber', name: 'Uber' },
  { id: 'lyft', name: 'Lyft' },
  { id: 'doordash', name: 'DoorDash' },
  { id: 'instacart', name: 'Instacart' },
  { id: 'grubhub', name: 'GrubHub' },
  { id: 'postmates', name: 'Postmates' },
  { id: 'amazon_flex', name: 'Amazon Flex' },
];

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEntriesStore = create((set, get) => ({
  // State
  entries: [],
  platforms: DEFAULT_PLATFORMS,
  caAdjustments: [], // California Prop 22 adjustments
  _hasHydrated: false,

  // Entry actions
  addEntry: (entryData) => {
    const newEntry = {
      id: generateId(),
      date: entryData.date || new Date().toISOString().split('T')[0],
      platformId: entryData.platformId,
      basePay: parseFloat(entryData.basePay) || 0,
      tips: parseFloat(entryData.tips) || 0,
      earnings: (parseFloat(entryData.basePay) || 0) + (parseFloat(entryData.tips) || 0),
      miles: parseFloat(entryData.miles) || 0,
      hours: parseFloat(entryData.hours) || 0,
      gasCost: parseFloat(entryData.gasCost) || 0,
      notes: entryData.notes || '',
      entryType: entryData.entryType || 'trip', // 'trip' or 'day-total'
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      entries: [...state.entries, newEntry],
    }));

    get()._persistEntries();
    return newEntry;
  },

  updateEntry: (id, updates) => {
    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...updates };
          // Recalculate earnings if basePay or tips changed
          if (updates.basePay !== undefined || updates.tips !== undefined) {
            updated.earnings = (parseFloat(updated.basePay) || 0) + (parseFloat(updated.tips) || 0);
          }
          return updated;
        }
        return entry;
      }),
    }));
    get()._persistEntries();
  },

  deleteEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }));
    get()._persistEntries();
  },

  // California adjustment actions
  addCAdjustment: (adjustmentData) => {
    const newAdjustment = {
      id: generateId(),
      date: adjustmentData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(adjustmentData.amount) || 0,
      platformId: adjustmentData.platformId || null,
      note: adjustmentData.note || 'CA Prop 22 Adjustment',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      caAdjustments: [...state.caAdjustments, newAdjustment],
    }));

    get()._persistAdjustments();
    return newAdjustment;
  },

  deleteCAdjustment: (id) => {
    set((state) => ({
      caAdjustments: state.caAdjustments.filter((adj) => adj.id !== id),
    }));
    get()._persistAdjustments();
  },

  // Platform actions
  addPlatform: (name) => {
    const newPlatform = {
      id: generateId(),
      name: name.trim(),
    };

    set((state) => ({
      platforms: [...state.platforms, newPlatform],
    }));

    get()._persistPlatforms();
    return newPlatform;
  },

  // Get entries by date
  getEntriesByDate: (date) => {
    return get().entries.filter((entry) => entry.date === date);
  },

  // Get entries for date range
  getEntriesInRange: (startDate, endDate) => {
    return get().entries.filter((entry) => entry.date >= startDate && entry.date <= endDate);
  },

  // Get platform by ID
  getPlatformById: (id) => {
    return get().platforms.find((p) => p.id === id);
  },

  // Clear all entries
  clearAllEntries: () => {
    set({ entries: [], caAdjustments: [] });
    get()._persistEntries();
    get()._persistAdjustments();
  },

  // Restore data from backup
  restoreData: (entries, platforms, caAdjustments) => {
    set({
      entries: entries || [],
      platforms: platforms || DEFAULT_PLATFORMS,
      caAdjustments: caAdjustments || [],
    });
    get()._persistEntries();
    get()._persistPlatforms();
    get()._persistAdjustments();
  },

  // Persistence
  _persistEntries: async () => {
    await saveData(STORAGE_KEYS.ENTRIES, get().entries);
  },

  _persistAdjustments: async () => {
    await saveData(STORAGE_KEYS.CA_ADJUSTMENTS, get().caAdjustments);
  },

  _persistPlatforms: async () => {
    await saveData(STORAGE_KEYS.PLATFORMS, get().platforms);
  },

  // Hydration
  hydrate: async () => {
    const [entries, caAdjustments, platforms] = await Promise.all([
      loadData(STORAGE_KEYS.ENTRIES, []),
      loadData(STORAGE_KEYS.CA_ADJUSTMENTS, []),
      loadData(STORAGE_KEYS.PLATFORMS),
    ]);

    set({
      entries: entries || [],
      caAdjustments: caAdjustments || [],
      platforms: platforms || DEFAULT_PLATFORMS,
      _hasHydrated: true,
    });
  },
}));
