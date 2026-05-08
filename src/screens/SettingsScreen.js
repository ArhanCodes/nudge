// settings. edit school, region, weekly target, reminders

import React, { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip, Spacer, Label, Input } from '../ui/components';
import { colors } from '../ui/theme';
import { REGIONS } from '../lib/regions';
import { scheduleDailyReminder, cancelAllReminders } from '../lib/notifications';

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Label>{label}</Label>
      <Input accessibilityLabel={label} {...props} />
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);

  const [schoolName, setSchoolName] = useState(state?.school?.name || '');
  const [schoolLat, setSchoolLat] = useState(state?.school ? String(state.school.latitude) : '');
  const [schoolLon, setSchoolLon] = useState(state?.school ? String(state.school.longitude) : '');
  const [target, setTarget] = useState(String(state?.targetKgPerWeek ?? 10));
  const [region, setRegion] = useState(state?.region || 'world');
  const [reminderOn, setReminderOn] = useState(true);

  async function onSave() {
    try {
      const lat = Number(schoolLat);
      const lon = Number(schoolLon);
      const t = Number(target);
      const hasSchool = schoolName.trim() && schoolLat && schoolLon;
      if (hasSchool) {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('School coordinates must be numbers');
        if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90');
        if (lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180');
      }
      if (!Number.isFinite(t) || t <= 0) throw new Error('Target must be a positive number');

      await setState({
        ...state,
        school: hasSchool ? { name: schoolName.trim(), latitude: lat, longitude: lon } : state?.school,
        targetKgPerWeek: t,
        region,
      });
      Alert.alert('Saved', 'Settings updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Settings', e?.message || 'Could not save');
    }
  }

  async function toggleReminder() {
    if (reminderOn) {
      await cancelAllReminders();
      setReminderOn(false);
      Alert.alert('Reminders', 'Daily reminders turned off.');
      return;
    }
    const id = await scheduleDailyReminder(20, 0);
    setReminderOn(true);
    Alert.alert(
      'Reminders',
      id ? 'You will be reminded at 8pm daily to log your activities.'
         : 'Could not enable reminders. Please check notification permissions.',
    );
  }

  const homeLabel = state?.home
    ? `Home set: ${state.home.label || `${state.home.latitude.toFixed(4)}, ${state.home.longitude.toFixed(4)}`}`
    : 'Home not set yet';

  return (
    <Screen>
      <Card>
        <Title>School</Title>
        <Muted style={{ marginTop: 6 }}>Set your school location to estimate commute distance.</Muted>
        <Field label="School name" value={schoolName} onChangeText={setSchoolName} placeholder="e.g. Dubai College" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Latitude" value={schoolLat} onChangeText={setSchoolLat} placeholder="25.2048" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Longitude" value={schoolLon} onChangeText={setSchoolLon} placeholder="55.2708" keyboardType="numeric" />
          </View>
        </View>
        <Button kind="ghost" label="Pick my home location (map)" onPress={() => navigation.navigate('PickLocation')} />
        <View style={{ marginTop: 10 }}>
          <Chip kind={state?.home ? 'brand' : 'default'} label={homeLabel} />
        </View>
      </Card>

      <Spacer />
      <Card>
        <Title>Region</Title>
        <Muted style={{ marginTop: 6 }}>
          Electricity grid carbon intensity varies by region. This adjusts your energy emission estimates.
        </Muted>
        <View style={styles.regionGrid}>
          {Object.entries(REGIONS).map(([key, r]) => (
            <Pressable
              key={key}
              onPress={() => setRegion(key)}
              style={[styles.regionPill, region === key && styles.regionPillActive]}
              accessibilityLabel={`Region: ${r.label}`}
            >
              <Text style={[styles.regionText, region === key && { color: colors.text }]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Spacer />
      <Card>
        <Title>Targets & Reminders</Title>
        <Muted style={{ marginTop: 6 }}>Weekly CO₂ goal (kg).</Muted>
        <Field label="Target kg CO₂ / week" value={target} onChangeText={setTarget} placeholder="10" keyboardType="numeric" />
        <View style={{ marginTop: 4 }}>
          <Button
            kind="ghost"
            label={reminderOn ? 'Turn Off Daily Reminder' : 'Turn On Daily Reminder (8pm)'}
            onPress={toggleReminder}
          />
        </View>
        <View style={{ marginTop: 14 }}>
          <Button label="Save Settings" onPress={onSave} />
        </View>
      </Card>

      <View style={{ marginTop: 12 }}>
        <Muted>
          Tip: if you don't want maps or location permissions, you can still log commutes by entering distance manually.
        </Muted>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  regionPill: {
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  regionPillActive: { borderColor: 'rgba(45,212,191,0.6)', backgroundColor: 'rgba(45,212,191,0.15)' },
  regionText: { color: colors.muted, fontWeight: '700', fontSize: 12 },
});
