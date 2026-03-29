import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scfd_state_v2';
const OLD_KEY = 'scfd_state_v1';

export function defaultState() {
  return {
    school: null, // user must set via onboarding or settings
    home: null,
    targetKgPerWeek: 10,
    region: 'world', // CO₂ grid region — see lib/co2.js
    onboarded: false, // has the user completed onboarding?

    // Unified logs across all 4 domains
    // { id, dateISO, category, itemKey, label, co2Kg, quantity, notes? }
    // category: 'transport' | 'diet' | 'energy' | 'waste'
    logs: [],
  };
}

function migrateV1(v1) {
  const logs = (v1.logs || []).map((l) => ({
    ...l,
    category: 'transport',
    itemKey: l.transport || 'car',
    label: l.transportLabel || l.transport || 'Car',
    quantity: 1,
  }));

  return {
    ...defaultState(),
    school: v1.school || null,
    home: v1.home || null,
    targetKgPerWeek: v1.targetKgPerWeek ?? 10,
    onboarded: true, // existing users don't need onboarding
    logs,
  };
}

export async function seedIfEmpty() {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing) return;

    // Check for v1 data to migrate
    const v1Raw = await AsyncStorage.getItem(OLD_KEY);
    if (v1Raw) {
      const v1 = JSON.parse(v1Raw);
      const migrated = migrateV1(v1);
      await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
      return;
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(defaultState()));
  } catch (e) {
    console.warn('seedIfEmpty failed, using defaults:', e);
  }
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // Ensure new fields exist after app updates
    return { ...defaultState(), ...parsed };
  } catch (e) {
    console.warn('loadState failed, using defaults:', e);
    return defaultState();
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState failed:', e);
    throw new Error('Could not save your data. Please try again.');
  }
}
