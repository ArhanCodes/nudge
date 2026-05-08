// persists app state to the device. all data stays local

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scfd_state_v2';
const OLD_KEY = 'scfd_state_v1';

// starting state for first-time users
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

// v1 only had transport logs. add the new fields
function migrateV1(v1) {
  const logs = (v1.logs || []).map((l) => ({
    ...l,
    category: 'transport',
    itemKey: l.transport || 'car',
    label: l.transportLabel || l.transport || 'Car',
    quantity: 1,
  }));
  return { ...defaultState(), ...v1, onboarded: true, logs };
}

// on first launch: migrate v1 if present, else write defaults
export async function seedIfEmpty() {
  try {
    if (await AsyncStorage.getItem(KEY)) return;
    const v1Raw = await AsyncStorage.getItem(OLD_KEY);
    const seed = v1Raw ? migrateV1(JSON.parse(v1Raw)) : defaultState();
    await AsyncStorage.setItem(KEY, JSON.stringify(seed));
  } catch (e) {
    console.warn('seedIfEmpty failed:', e);
  }
}

// read state, fall back to defaults on any error
export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch (e) {
    console.warn('loadState failed:', e);
    return defaultState();
  }
}

// write entire state to disk
export async function saveState(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState failed:', e);
    throw new Error('Could not save your data. Please try again.');
  }
}
