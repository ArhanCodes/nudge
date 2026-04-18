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

export default function App() {
  const [state, setState] = useState(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      const s = await loadState();
      setState(s);
      setBooted(true);

      // Schedule daily reminder notification (8pm)
      scheduleDailyReminder(20, 0).catch(() => {});
    })();
  }, []);

  const api = useMemo(() => {
    return {
      booted,
      state,
      setState: async (next) => {
        setState(next);
        await saveState(next);
      },
    };
  }, [booted, state]);

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
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Nudge' }} />
              <Stack.Screen name="LogActivity" component={LogActivityScreen} options={{ title: 'Log Activity' }} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Progress Dashboard' }} />
              <Stack.Screen name="Tips" component={TipsScreen} options={{ title: 'Weekly Tips' }} />
              <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges & Streaks' }} />
              <Stack.Screen name="Trends" component={TrendsScreen} options={{ title: 'Weekly Trends' }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              <Stack.Screen name="PickLocation" component={LocationPickerScreen} options={{ title: 'Pick Location' }} />
              <Stack.Screen name="Export" component={ExportScreen} options={{ title: 'Export Data' }} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </AppContext.Provider>
    </ErrorBoundary>
  );
}
