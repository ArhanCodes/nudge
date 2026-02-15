import React, { useContext, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { TRANSPORT_LABELS, computeCo2Kg } from '../lib/co2';
import { haversineKm } from '../lib/geo';

const TRANSPORTS = Object.keys(TRANSPORT_LABELS);

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function LogCommuteScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);

  const [transport, setTransport] = useState('car');
  const [oneWayKm, setOneWayKm] = useState('');
  const [notes, setNotes] = useState('');

  const suggestedKm = useMemo(() => {
    if (!state?.home || !state?.school) return null;
    const km = haversineKm(state.home, state.school);
    // Straight-line distance underestimates real route. Inflate a bit.
    return km * 1.25;
  }, [state]);

  async function onUseSuggested() {
    if (!suggestedKm) return;
    setOneWayKm(suggestedKm.toFixed(1));
  }

  async function onSave() {
    try {
      const km = Number(oneWayKm);
      if (!Number.isFinite(km) || km <= 0) throw new Error('Distance must be a positive number');

      const co2Kg = computeCo2Kg({ transport, oneWayKm: km });
      const log = {
        id: uid(),
        dateISO: new Date().toISOString(),
        transport,
        transportLabel: TRANSPORT_LABELS[transport] || transport,
        oneWayKm: km,
        co2Kg,
        notes: notes.trim() || undefined,
      };

      await setState({
        ...state,
        logs: [log, ...(state?.logs || [])],
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Log commute', e?.message || 'Could not save');
    }
  }

  return (
    <Screen>
      <Card>
        <Title>Transport</Title>
        <Muted style={{ marginTop: 6 }}>Tap a mode, then enter your one-way distance.</Muted>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {TRANSPORTS.map((t) => (
            <Pressable key={t} onPress={() => setTransport(t)} style={[styles.pill, transport === t && styles.pillActive]}>
              <Text style={[styles.pillText, transport === t && styles.pillTextActive]}>{TRANSPORT_LABELS[t]}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>One-way distance (km)</Text>
          <TextInput
            value={oneWayKm}
            onChangeText={setOneWayKm}
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 7.5"
            placeholderTextColor="rgba(255,255,255,0.45)"
          />
        </View>

        {suggestedKm ? (
          <View style={{ marginTop: 10 }}>
            <Chip label={`Suggested from map: ~${suggestedKm.toFixed(1)} km one-way`} />
            <View style={{ height: 8 }} />
            <Button kind="ghost" label="Use suggested distance" onPress={onUseSuggested} />
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Chip label="Set your home location in Settings to get a suggested distance" />
          </View>
        )}

        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            multiline
            placeholder="e.g., carpool with 2 friends"
            placeholderTextColor="rgba(255,255,255,0.45)"
          />
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          <Button label="Save" onPress={onSave} />
          <Button kind="ghost" label="Cancel" onPress={() => navigation.goBack()} />
        </View>

        <Muted style={{ marginTop: 10 }}>
          CO₂ estimate uses simple factors per km and assumes a round trip (to school and back).
        </Muted>
      </Card>
    </Screen>
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
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  pillActive: {
    borderColor: 'rgba(45,212,191,0.6)',
    backgroundColor: 'rgba(45,212,191,0.15)',
  },
  pillText: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 12,
  },
  pillTextActive: {
    color: colors.text,
  },
});
