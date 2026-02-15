import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip } from '../ui/components';
import { colors } from '../ui/theme';

export default function SettingsScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);

  const [schoolName, setSchoolName] = useState(state?.school?.name || 'My School');
  const [schoolLat, setSchoolLat] = useState(String(state?.school?.latitude ?? 25.2048));
  const [schoolLon, setSchoolLon] = useState(String(state?.school?.longitude ?? 55.2708));
  const [target, setTarget] = useState(String(state?.targetKgPerWeek ?? 10));

  async function onSave() {
    try {
      const lat = Number(schoolLat);
      const lon = Number(schoolLon);
      const t = Number(target);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('School coordinates must be numbers');
      if (!Number.isFinite(t) || t <= 0) throw new Error('Target must be a positive number');

      await setState({
        ...state,
        school: { name: schoolName.trim() || 'My School', latitude: lat, longitude: lon },
        targetKgPerWeek: t,
      });
      Alert.alert('Saved', 'Settings updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Settings', e?.message || 'Could not save');
    }
  }

  return (
    <Screen>
      <Card>
        <Title>School</Title>
        <Muted style={{ marginTop: 6 }}>Set your school’s location (used to estimate commute distance).</Muted>

        <Field label="School name" value={schoolName} onChangeText={setSchoolName} placeholder="Dubai College" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Latitude" value={schoolLat} onChangeText={setSchoolLat} placeholder="25.2048" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Longitude" value={schoolLon} onChangeText={setSchoolLon} placeholder="55.2708" keyboardType="numeric" />
          </View>
        </View>

        <Button kind="ghost" label="Pick my home location (Google map)" onPress={() => navigation.navigate('PickLocation')} />

        <View style={{ marginTop: 10 }}>
          {state?.home ? (
            <Chip kind="brand" label={`Home set: ${state.home.label || `${state.home.latitude.toFixed(4)}, ${state.home.longitude.toFixed(4)}`}`} />
          ) : (
            <Chip label="Home not set yet" />
          )}
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Title>Targets</Title>
        <Muted style={{ marginTop: 6 }}>Weekly CO₂ goal (kg). The dashboard compares your week vs this target.</Muted>
        <Field label="Target kg CO₂ / week" value={target} onChangeText={setTarget} placeholder="10" keyboardType="numeric" />
        <Button label="Save" onPress={onSave} />
      </Card>

      <View style={{ marginTop: 12 }}>
        <Muted>
          Tip: if you don’t want maps or location permissions, you can still log commutes by entering distance manually.
        </Muted>
      </View>
    </Screen>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.45)" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontWeight: '900', marginBottom: 6 },
  input: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
