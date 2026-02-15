import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { startOfWeekISO, weekKeyISO } from '../utils/time';

export default function HomeScreen({ navigation }) {
  const { state } = useContext(AppContext);

  const summary = useMemo(() => {
    const now = new Date();
    const wk = weekKeyISO(now);

    const logs = (state?.logs || []).filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
    const totalKg = logs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const target = state?.targetKgPerWeek ?? 10;
    const remaining = Math.max(0, target - totalKg);
    const over = Math.max(0, totalKg - target);

    return {
      weekStart: startOfWeekISO(now),
      totalKg,
      target,
      remaining,
      over,
      logs,
    };
  }, [state]);

  return (
    <Screen>
      <Card>
        <Title>Weekly footprint</Title>
        <Muted style={{ marginTop: 6 }}>Week starting {summary.weekStart}</Muted>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <Chip kind="brand" label={`This week: ${summary.totalKg.toFixed(2)} kg CO₂`} />
          <Chip label={`Target: ${summary.target.toFixed(1)} kg`} />
          {summary.over > 0 ? <Chip label={`Over: +${summary.over.toFixed(2)} kg`} /> : <Chip label={`Remaining: ${summary.remaining.toFixed(2)} kg`} />}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Button label="+ Log commute" onPress={() => navigation.navigate('Log')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button kind="ghost" label="Trends" onPress={() => navigation.navigate('Trends')} />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Button kind="ghost" label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Title style={{ fontSize: 18 }}>Recent logs</Title>
        <Muted style={{ marginTop: 6 }}>Your latest commute entries.</Muted>

        <View style={{ height: 10 }} />

        <FlatList
          data={(state?.logs || []).slice().sort((a, b) => (b.dateISO > a.dateISO ? 1 : -1)).slice(0, 8)}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Muted>No logs yet. Tap “Log commute”.</Muted>}
          renderItem={({ item }) => {
            return (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.transportLabel}</Text>
                  <Muted>{new Date(item.dateISO).toLocaleDateString()} • {item.oneWayKm.toFixed(1)} km one-way</Muted>
                </View>
                <Text style={styles.kg}>{item.co2Kg.toFixed(2)} kg</Text>
              </View>
            );
          }}
        />
      </Card>

      <View style={{ marginTop: 12 }}>
        <Muted style={{ textAlign: 'center' }}>
          Educational estimate. Real emissions vary by vehicle, traffic, and occupancy.
        </Muted>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  kg: {
    color: colors.text,
    fontWeight: '900',
  },
});
