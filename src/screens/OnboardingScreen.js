// Onboarding: shown once on first launch. Walks the user through:
// welcome → school location → region → weekly target.
// Marks the user as `onboarded` at the end so this screen never shows again.

import React, { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Label, Input } from '../ui/components';
import { colors } from '../ui/theme';
import { REGIONS } from '../lib/regions';

const STEPS = ['welcome', 'school', 'region', 'target'];

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Label>{label}</Label>
      <Input accessibilityLabel={label} {...props} />
    </View>
  );
}

export default function OnboardingScreen() {
  const { state, setState } = useContext(AppContext);

  const [step, setStep] = useState(0);
  const [schoolName, setSchoolName] = useState('');
  const [schoolLat, setSchoolLat] = useState('');
  const [schoolLon, setSchoolLon] = useState('');
  const [region, setRegion] = useState('world');
  const [target, setTarget] = useState('10');

  async function onFinish() {
    try {
      const lat = Number(schoolLat);
      const lon = Number(schoolLon);
      const t = Number(target);
      const named = !!schoolName.trim();
      if (named && (!Number.isFinite(lat) || !Number.isFinite(lon))) throw new Error('Please enter valid coordinates for your school.');
      if (named && (lat < -90 || lat > 90 || lon < -180 || lon > 180)) throw new Error('Coordinates out of range.');
      if (!Number.isFinite(t) || t <= 0) throw new Error('Target must be a positive number.');

      await setState({
        ...state,
        school: named ? { name: schoolName.trim(), latitude: lat, longitude: lon } : null,
        region,
        targetKgPerWeek: t,
        onboarded: true,
      });
    } catch (e) {
      Alert.alert('Setup', e?.message || 'Could not save');
    }
  }

  const current = STEPS[step];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: step <= 1 ? 'center' : undefined, paddingBottom: 40 }}
      >
        {current === 'welcome' && (
          <Card>
            <Text style={styles.emoji}>🌍</Text>
            <Title style={{ textAlign: 'center', fontSize: 28 }}>Welcome to Nudge</Title>
            <Muted style={{ textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
              Track your carbon footprint, earn badges, and get personalised tips to reduce your environmental impact.
            </Muted>
            <View style={{ marginTop: 24 }}>
              <Button label="Get Started" onPress={() => setStep(1)} />
            </View>
          </Card>
        )}

        {current === 'school' && (
          <Card>
            <Title>Your School</Title>
            <Muted style={{ marginTop: 6 }}>
              Enter your school details to estimate commute distance. You can skip this and set it later in Settings.
            </Muted>
            <Field label="School name" value={schoolName} onChangeText={setSchoolName} placeholder="e.g. Dubai College" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="Latitude" value={schoolLat} onChangeText={setSchoolLat} placeholder="25.2048" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Longitude" value={schoolLon} onChangeText={setSchoolLon} placeholder="55.2708" keyboardType="numeric" />
              </View>
            </View>
            <View style={{ marginTop: 14, gap: 10 }}>
              <Button label="Next" onPress={() => setStep(2)} />
              <Button kind="ghost" label="Skip for now" onPress={() => setStep(2)} />
            </View>
          </Card>
        )}

        {current === 'region' && (
          <Card>
            <Title>Your Region</Title>
            <Muted style={{ marginTop: 6 }}>
              Electricity grid carbon intensity varies by region. Pick yours for more accurate energy estimates.
            </Muted>
            <View style={styles.regionGrid}>
              {Object.entries(REGIONS).map(([key, r]) => (
                <Button
                  key={key}
                  kind={region === key ? 'primary' : 'ghost'}
                  label={r.label}
                  onPress={() => setRegion(key)}
                />
              ))}
            </View>
            <View style={{ marginTop: 14 }}>
              <Button label="Next" onPress={() => setStep(3)} />
            </View>
          </Card>
        )}

        {current === 'target' && (
          <Card>
            <Title>Weekly Target</Title>
            <Muted style={{ marginTop: 6 }}>
              Set a weekly CO₂ budget in kg. The average person produces about 22 kg/day. A stretching but achievable student target is 10 kg/week.
            </Muted>
            <Field label="Target (kg CO₂ / week)" value={target} onChangeText={setTarget} placeholder="10" keyboardType="numeric" />
            <View style={{ marginTop: 14 }}>
              <Button label="Start Tracking" onPress={onFinish} />
            </View>
          </Card>
        )}

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  regionGrid: { gap: 8, marginTop: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: colors.brand, width: 24 },
});
