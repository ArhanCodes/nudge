// App entry point. Sets up:
//   1. Global state (loaded from AsyncStorage)
//   2. React Navigation stack
//   3. Onboarding redirect for first-time users

import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import LogActivityScreen from './src/screens/LogActivityScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TipsScreen from './src/screens/TipsScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ExportScreen from './src/screens/ExportScreen';

import { AppContext } from './src/state/context';
import { loadState, saveState, seedIfEmpty } from './src/state/storage';
import { ErrorBoundary } from './src/ui/ErrorBoundary';
import { scheduleDailyReminder } from './src/lib/notifications';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0b1020' },
  headerTintColor: 'rgba(255,255,255,0.92)',
  headerTitleStyle: { fontWeight: '900' },
};

// All screens shown after onboarding, in their stack order.
const SCREENS = [
  { name: 'Home', component: HomeScreen, title: 'Nudge' },
  { name: 'LogActivity', component: LogActivityScreen, title: 'Log Activity' },
  { name: 'Dashboard', component: DashboardScreen, title: 'Progress Dashboard' },
  { name: 'Tips', component: TipsScreen, title: 'Weekly Tips' },
  { name: 'Badges', component: BadgesScreen, title: 'Badges & Streaks' },
  { name: 'Trends', component: TrendsScreen, title: 'Weekly Trends' },
  { name: 'Settings', component: SettingsScreen, title: 'Settings' },
  { name: 'PickLocation', component: LocationPickerScreen, title: 'Pick Location' },
  { name: 'Export', component: ExportScreen, title: 'Export Data' },
];

export default function App() {
  // The single source of truth for the whole app's data.
  const [state, setState] = useState(null);
  const [booted, setBooted] = useState(false);

  // On first render: load saved state from disk, then schedule the 8pm reminder.
  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      setState(await loadState());
      setBooted(true);
      scheduleDailyReminder(20, 0).catch(() => {});
    })();
  }, []);

  // The value provided to every screen via React Context.
  // setState() updates state in memory AND saves it to disk.
  const api = useMemo(() => ({
    booted,
    state,
    setState: async (next) => {
      setState(next);
      await saveState(next);
    },
  }), [booted, state]);

  const needsOnboarding = booted && state && !state.onboarded;

  return (
    <ErrorBoundary>
      <AppContext.Provider value={api}>
        <NavigationContainer>
          <StatusBar style="light" />
          {needsOnboarding ? (
            <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator screenOptions={screenOptions}>
              {SCREENS.map(({ name, component, title }) => (
                <Stack.Screen key={name} name={name} component={component} options={{ title }} />
              ))}
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </AppContext.Provider>
    </ErrorBoundary>
  );
}
