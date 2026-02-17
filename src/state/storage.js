import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scfd_state_v2';
const OLD_KEY = 'scfd_state_v1';

function defaultState() {
  return {
    school: {
      name: 'My School',
      latitude: 25.2048,
      longitude: 55.2708,
    },
    home: null,
    targetKgPerWeek: 10,

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
    school: v1.school || defaultState().school,
    home: v1.home || null,
    targetKgPerWeek: v1.targetKgPerWeek ?? 10,
    logs,
  };
}

export async function seedIfEmpty() {
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
}

export async function loadState() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : defaultState();
}

export async function saveState(state) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
