// log activity form. pick a category, then transport+distance or an item. saves to state

import React, { useContext, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Spacer, Label, Input } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, TRANSPORT_LABELS, getCategoryItems, computeCo2Kg } from '../lib/co2';
import { haversineKm } from '../lib/geo';

// random uuid v4 so each log has a unique id
function uid() {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function Pill({ active, activeColor, onPress, children, big }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        big ? styles.bigPill : styles.pill,
        active && (activeColor
          ? { borderColor: activeColor, backgroundColor: activeColor + '22' }
          : styles.pillActive),
      ]}
    >
      {children}
    </Pressable>
  );
}

const CAT_KEYS = Object.keys(CATEGORIES);

export default function LogActivityScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);

  const [category, setCategory] = useState('transport');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [transport, setTransport] = useState('car');
  const [oneWayKm, setOneWayKm] = useState('');

  const suggestedKm = useMemo(() => {
    if (!state?.home || !state?.school) return null;
    return haversineKm(state.home, state.school) * 1.25;
  }, [state]);

  const items = useMemo(() => getCategoryItems(category, state?.region), [category, state?.region]);

  const preview = useMemo(() => {
    if (category === 'transport') {
      const km = Number(oneWayKm);
      if (!Number.isFinite(km) || km <= 0) return null;
      return computeCo2Kg({ transport, oneWayKm: km });
    }
    if (!selectedItem || !items[selectedItem]) return null;
    return items[selectedItem].co2 * (Number(quantity) || 1);
  }, [category, transport, oneWayKm, selectedItem, quantity, items]);

  async function onSave() {
    try {
      let log;
      if (category === 'transport') {
        const km = Number(oneWayKm);
        if (!Number.isFinite(km) || km <= 0) throw new Error('Enter a valid distance');
        const transportLabel = TRANSPORT_LABELS[transport] || transport;
        log = {
          id: uid(),
          dateISO: new Date().toISOString(),
          category: 'transport',
          itemKey: transport,
          label: transportLabel,
          co2Kg: computeCo2Kg({ transport, oneWayKm: km }),
          quantity: 1,
          oneWayKm: km,
          transport,
          transportLabel,
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
      await setState({ ...state, logs: [log, ...(state?.logs || [])] });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Log activity', e?.message || 'Could not save');
    }
  }

  const cat = CATEGORIES[category];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Title>Category</Title>
          <View style={styles.pillRow}>
            {CAT_KEYS.map((k) => (
              <Pill
                key={k}
                big
                active={category === k}
                activeColor={CATEGORIES[k].color}
                onPress={() => { setCategory(k); setSelectedItem(null); }}
              >
                <Text style={[styles.bigPillText, category === k && { color: colors.text }]}>
                  {CATEGORIES[k].icon} {CATEGORIES[k].label}
                </Text>
              </Pill>
            ))}
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={{ fontSize: 18 }}>{cat.icon} {cat.label} Activity</Title>

          {category === 'transport' ? (
            <>
              <Muted style={{ marginTop: 6 }}>Select transport mode and enter one-way distance.</Muted>
              <View style={styles.pillRow}>
                {Object.keys(TRANSPORT_LABELS).map((t) => (
                  <Pill key={t} active={transport === t} onPress={() => setTransport(t)}>
                    <Text style={[styles.pillText, transport === t && { color: colors.text }]}>
                      {TRANSPORT_LABELS[t]}
                    </Text>
                  </Pill>
                ))}
              </View>
              <Label>One-way distance (km)</Label>
              <Input value={oneWayKm} onChangeText={setOneWayKm} keyboardType="numeric" placeholder="e.g., 7.5" />
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
                {Object.keys(items).map((k) => {
                  const item = items[k];
                  return (
                    <Pill
                      key={k}
                      active={selectedItem === k}
                      activeColor={cat.color}
                      onPress={() => setSelectedItem(k)}
                    >
                      <View style={styles.itemPillContent}>
                        <Text style={[styles.pillText, selectedItem === k && { color: colors.text }]}>
                          {item.icon} {item.label}
                        </Text>
                        <Text style={styles.co2Badge}>{item.co2 > 0 ? '+' : ''}{item.co2} kg</Text>
                      </View>
                    </Pill>
                  );
                })}
              </View>
              {selectedItem && (
                <View style={{ marginTop: 8 }}>
                  <Label>Quantity / times</Label>
                  <Input value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="1" />
                </View>
              )}
            </>
          )}
        </Card>

        <Spacer />
        <Card>
          {preview !== null && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>CO₂e impact</Text>
              <Text style={[styles.previewValue, { color: preview >= 0 ? colors.danger : colors.success }]}>
                {preview >= 0 ? '+' : ''}{preview.toFixed(2)} kg CO₂e
              </Text>
            </View>
          )}
          <Label>Notes (optional)</Label>
          <Input
            value={notes}
            onChangeText={setNotes}
            style={{ minHeight: 60, textAlignVertical: 'top' }}
            multiline
            placeholder="e.g., carpooled with 2 friends"
          />
          <View style={{ marginTop: 14, gap: 10 }}>
            <Button label="Save Activity" onPress={onSave} />
            <Button kind="ghost" label="Cancel" onPress={() => navigation.goBack()} />
          </View>
        </Card>

        <Spacer h={30} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  pill: {
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bigPill: {
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  pillActive: { borderColor: 'rgba(45,212,191,0.6)', backgroundColor: 'rgba(45,212,191,0.15)' },
  pillText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  bigPillText: { color: colors.muted, fontWeight: '900', fontSize: 13 },
  itemPillContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  co2Badge: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center',
  },
  previewLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  previewValue: { fontSize: 28, fontWeight: '900', marginTop: 4 },
});
