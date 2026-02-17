import React, { useContext, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button } from '../ui/components';
import { colors } from '../ui/theme';
import {
  CATEGORIES,
  TRANSPORT_LABELS,
  CO2_FACTORS,
  getCategoryItems,
  computeCo2Kg,
} from '../lib/co2';
import { haversineKm } from '../lib/geo';

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const CAT_KEYS = Object.keys(CATEGORIES);

export default function LogActivityScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);

  const [category, setCategory] = useState('transport');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  // Transport-specific
  const [transport, setTransport] = useState('car');
  const [oneWayKm, setOneWayKm] = useState('');

  const suggestedKm = useMemo(() => {
    if (!state?.home || !state?.school) return null;
    return haversineKm(state.home, state.school) * 1.25;
  }, [state]);

  const items = useMemo(() => getCategoryItems(category), [category]);
  const itemKeys = Object.keys(items);

  const preview = useMemo(() => {
    if (category === 'transport') {
      const km = Number(oneWayKm);
      if (!Number.isFinite(km) || km <= 0) return null;
      return computeCo2Kg({ transport, oneWayKm: km });
    }
    if (!selectedItem || !items[selectedItem]) return null;
    const q = Number(quantity) || 1;
    return items[selectedItem].co2 * q;
  }, [category, transport, oneWayKm, selectedItem, quantity, items]);

  async function onSave() {
    try {
      let log;

      if (category === 'transport') {
        const km = Number(oneWayKm);
        if (!Number.isFinite(km) || km <= 0) throw new Error('Enter a valid distance');
        const co2Kg = computeCo2Kg({ transport, oneWayKm: km });
        log = {
          id: uid(),
          dateISO: new Date().toISOString(),
          category: 'transport',
          itemKey: transport,
          label: TRANSPORT_LABELS[transport] || transport,
          co2Kg,
          quantity: 1,
          oneWayKm: km,
          transport,
          transportLabel: TRANSPORT_LABELS[transport] || transport,
          notes: notes.trim() || undefined,
        };
      } else {
        if (!selectedItem) throw new Error('Select an activity');
        const q = Math.max(1, Math.round(Number(quantity) || 1));
        const item = items[selectedItem];
        log = {
          id: uid(),
          dateISO: new Date().toISOString(),
          category,
          itemKey: selectedItem,
          label: item.label,
          co2Kg: item.co2 * q,
          quantity: q,
          notes: notes.trim() || undefined,
        };
      }

      await setState({
        ...state,
        logs: [log, ...(state?.logs || [])],
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Log activity', e?.message || 'Could not save');
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category selector */}
        <Card>
          <Title>Category</Title>
          <View style={styles.pillRow}>
            {CAT_KEYS.map((k) => (
              <Pressable
                key={k}
                onPress={() => {
                  setCategory(k);
                  setSelectedItem(null);
                }}
                style={[styles.catPill, category === k && { borderColor: CATEGORIES[k].color, backgroundColor: CATEGORIES[k].color + '22' }]}
              >
                <Text style={[styles.catPillText, category === k && { color: colors.text }]}>
                  {CATEGORIES[k].icon} {CATEGORIES[k].label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Activity picker */}
        <Card>
          <Title style={{ fontSize: 18 }}>
            {CATEGORIES[category].icon} {CATEGORIES[category].label} Activity
          </Title>

          {category === 'transport' ? (
            <>
              <Muted style={{ marginTop: 6 }}>Select transport mode and enter one-way distance.</Muted>
              <View style={styles.pillRow}>
                {Object.keys(TRANSPORT_LABELS).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTransport(t)}
                    style={[styles.pill, transport === t && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, transport === t && styles.pillTextActive]}>
                      {TRANSPORT_LABELS[t]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>One-way distance (km)</Text>
              <TextInput
                value={oneWayKm}
                onChangeText={setOneWayKm}
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g., 7.5"
                placeholderTextColor="rgba(255,255,255,0.45)"
              />
              {suggestedKm && (
                <Button
                  kind="ghost"
                  label={`Use suggested: ~${suggestedKm.toFixed(1)} km`}
                  onPress={() => setOneWayKm(suggestedKm.toFixed(1))}
                />
              )}
            </>
          ) : (
            <>
              <Muted style={{ marginTop: 6 }}>Tap an activity to select it.</Muted>
              <View style={styles.pillRow}>
                {itemKeys.map((k) => {
                  const item = items[k];
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setSelectedItem(k)}
                      style={[
                        styles.itemPill,
                        selectedItem === k && {
                          borderColor: CATEGORIES[category].color,
                          backgroundColor: CATEGORIES[category].color + '22',
                        },
                      ]}
                    >
                      <Text style={[styles.pillText, selectedItem === k && { color: colors.text }]}>
                        {item.icon} {item.label}
                      </Text>
                      <Text style={styles.co2Badge}>
                        {item.co2 > 0 ? '+' : ''}{item.co2} kg
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedItem && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Quantity / times</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                  />
                </View>
              )}
            </>
          )}
        </Card>

        <View style={{ height: 12 }} />

        {/* Preview + Notes + Save */}
        <Card>
          {preview !== null && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>CO₂e impact</Text>
              <Text style={[styles.previewValue, { color: preview >= 0 ? '#ef4444' : '#22c55e' }]}>
                {preview >= 0 ? '+' : ''}{preview.toFixed(2)} kg CO₂e
              </Text>
            </View>
          )}

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            multiline
            placeholder="e.g., carpooled with 2 friends"
            placeholderTextColor="rgba(255,255,255,0.45)"
          />

          <View style={{ marginTop: 14, gap: 10 }}>
            <Button label="Save Activity" onPress={onSave} />
            <Button kind="ghost" label="Cancel" onPress={() => navigation.goBack()} />
          </View>
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  catPill: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  catPillText: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 13,
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
  itemPill: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  co2Badge: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  label: { color: colors.muted, fontWeight: '900', marginBottom: 6, marginTop: 10 },
  input: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  previewLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  previewValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
});
