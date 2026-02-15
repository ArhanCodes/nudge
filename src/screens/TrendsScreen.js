import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { weekKeyISO, startOfWeekISO, addDaysISO } from '../utils/time';

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function TrendsScreen() {
  const { state } = useContext(AppContext);

  const data = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();
    const wk = weekKeyISO(now);
    const startISO = startOfWeekISO(now);

    const daily = Array.from({ length: 7 }).map((_, i) => ({
      day: addDaysISO(startISO, i),
      kg: 0,
    }));

    for (const l of logs) {
      if (weekKeyISO(new Date(l.dateISO)) !== wk) continue;
      const day = new Date(l.dateISO).toISOString().slice(0, 10);
      const idx = daily.findIndex((d) => d.day === day);
      if (idx >= 0) daily[idx].kg += l.co2Kg || 0;
    }

    const total = daily.reduce((a, d) => a + d.kg, 0);
    const max = Math.max(1, ...daily.map((d) => d.kg));
    return { daily, total, max, startISO };
  }, [state]);

  const target = state?.targetKgPerWeek ?? 10;
  const perDayTarget = target / 7;

  return (
    <Screen>
      <Card>
        <Title>Weekly emissions</Title>
        <Muted style={{ marginTop: 6 }}>Week starting {data.startISO}</Muted>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <Chip kind="brand" label={`Total: ${data.total.toFixed(2)} kg CO₂`} />
          <Chip label={`Target: ${target.toFixed(1)} kg`} />
          <Chip label={`Daily guide: ${perDayTarget.toFixed(2)} kg/day`} />
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Title style={{ fontSize: 18 }}>Trend chart</Title>
        <Muted style={{ marginTop: 6 }}>Simple bar chart (kg CO₂ per day).</Muted>

        <View style={{ height: 12 }} />

        {data.daily.map((d) => {
          const ratio = d.kg / data.max;
          const widthPct = clamp(ratio, 0, 1) * 100;
          return (
            <View key={d.day} style={{ marginBottom: 10 }}>
              <View style={styles.dayRow}>
                <Text style={styles.day}>{new Date(d.day).toLocaleDateString(undefined, { weekday: 'short' })}</Text>
                <Text style={styles.kg}>{d.kg.toFixed(2)} kg</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${widthPct}%` }]} />
              </View>
            </View>
          );
        })}

        <View style={{ marginTop: 8 }}>
          <Muted>
            Suggestions: If you’re over target, try 1–2 days of walking/cycling, public transport, or carpooling.
          </Muted>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { color: colors.text, fontWeight: '900' },
  kg: { color: colors.muted, fontWeight: '900' },
  barBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.brand2,
  },
});
