// Persists app state to the device using AsyncStorage (iOS Keychain / Android
// SharedPreferences via Expo). All data stays on the user's phone — nothing
// is sent over the network.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scfd_state_v2';
const OLD_KEY = 'scfd_state_v1';

// Empty starting state for first-time users.
export function defaultState() {
  return {
    school: null,
    home: null,
    targetKgPerWeek: 10,
    region: 'world',
    onboarded: false,
    logs: [],
  };
}

// v1 → v2 schema migration: v1 only tracked transport.
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
    onboarded: true,
    logs,
  };
}

// On first launch: create a default state, or migrate from v1 if present.
export async function seedIfEmpty() {
  try {
    if (await AsyncStorage.getItem(KEY)) return;
    const v1Raw = await AsyncStorage.getItem(OLD_KEY);
    if (v1Raw) {
      const migrated = migrateV1(JSON.parse(v1Raw));
      await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
      return;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(defaultState()));
  } catch (e) {
    console.warn('seedIfEmpty failed, using defaults:', e);
  }
}

// Read state from disk. Always falls back to defaults so the app never crashes.
export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn('loadState failed, using defaults:', e);
    return defaultState();
  }
}

// Write the entire state blob to disk.
export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState failed:', e);
    throw new Error('Could not save your data. Please try again.');
  }
}
