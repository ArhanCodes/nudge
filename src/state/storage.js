import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'scfd_state_v1';

function defaultState() {
  return {
    // School location (can be changed in Settings)
    school: {
      name: 'My School',
      latitude: 25.2048,
      longitude: 55.2708,
    },

    // Home location (picked by student)
    home: null, // { latitude, longitude, label }

    // Targets
    targetKgPerWeek: 10,

    // Commute logs
    // { id, dateISO, transport, oneWayKm, co2Kg, notes? }
    logs: [],
  };
}

export async function seedIfEmpty() {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return;
  await AsyncStorage.setItem(KEY, JSON.stringify(defaultState()));
}

export async function loadState() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : defaultState();
}

export async function saveState(state) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
