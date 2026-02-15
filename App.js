import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import LogCommuteScreen from './src/screens/LogCommuteScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';

import { AppContext } from './src/state/context';
import { loadState, saveState, seedIfEmpty } from './src/state/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, setState] = useState(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      const s = await loadState();
      setState(s);
      setBooted(true);
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

  return (
    <AppContext.Provider value={api}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Carbon Dashboard' }} />
          <Stack.Screen name="Log" component={LogCommuteScreen} options={{ title: 'Log commute' }} />
          <Stack.Screen name="Trends" component={TrendsScreen} options={{ title: 'Weekly trends' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="PickLocation" component={LocationPickerScreen} options={{ title: 'Pick location' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}
