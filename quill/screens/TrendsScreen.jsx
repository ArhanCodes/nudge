
import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip } from '../ui/components';
import { brand, brand2, textColor, muted, border } from '../ui/theme';
import { weekKeyISO, startOfWeekISO, addDaysISO } from '../utils/time';
export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
export default function TrendsScreen() {
  const ctx = useContext(AppContext);

  const computeTrends = (appData) => {
    let logs = appData?.logs || [];
    let now = new Date();
    let wk = weekKeyISO(now);
    let startISO = startOfWeekISO(now);
    let daily = Array.from({ length: 7 }).map((_, i) => ({ day: addDaysISO(startISO, i), kg: 0 }));
    for (const l of logs) {
      if (weekKeyISO(new Date(l.dateISO)) !== wk) {
        continue;
      }
      let day = new Date(l.dateISO).toISOString().slice(0, 10);
      let idx = daily.findIndex((d) => d.day === day);
      if (!(idx < 0)) {
        daily[idx].kg = daily[idx].kg + (l.co2Kg || 0);
      }
    }
    let total = daily.reduce((a, d) => a + d.kg, 0);
    let max = Math.max.apply(Math, [1].concat(daily.map((d) => d.kg)));
    return { daily: daily, total: total, max: max, startISO: startISO };
  };

  const computeBarWidth = (kg, maxVal) => {
    let ratio = kg / maxVal;
    return clamp(ratio, 0, 1) * 100;
  };

  const makeBarWidth = (kg, maxVal) => {
    return { width: computeBarWidth(kg, maxVal) + "%" };
  };

  const data = useMemo(() => computeTrends(ctx.state), [ctx]);
  const target = useMemo(() => ctx.state?.targetKgPerWeek || 10, [ctx]);
  const perDayTarget = useMemo(() => (ctx.state?.targetKgPerWeek || 10) / 7, [ctx]);

  return (
    <Screen>
      <Card>
        <Title>Weekly emissions</Title>
        <Muted style={styles.weekSubtitle}>Week starting {data.startISO}</Muted>
        <View style={styles.chipRow}>
          <Chip kind={"brand"} label={`Total: ${data.total.toFixed(2)} kg CO2`} />
          <Chip label={`Target: ${target.toFixed(1)} kg`} />
          <Chip label={`Daily guide: ${perDayTarget.toFixed(2)} kg/day`} />
        </View>
      </Card>
      <View style={styles.spacer} />
      <Card>
        <Title style={styles.chartTitle}>Trend chart</Title>
        <Muted style={styles.chartSubtitle}>Simple bar chart (kg CO2 per day).</Muted>
        <View style={styles.spacer} />
        {data.daily.map((d, __idx) => {
          const bw = computeBarWidth(d.kg, data.max) + "%";
          return (
            <View style={styles.barRow} key={__idx}>
              <View style={styles.dayRow}>
                <Text style={styles.dayLabel}>{new Date(d.day + 'T00:00:00Z').toLocaleDateString(null, { weekday: 'short' })}</Text>
                <Text style={styles.kgLabel}>{d.kg.toFixed(2)} kg</Text>
              </View>
              <View style={styles.barBg}>
                <View style={{ height: "100%", backgroundColor: "#7c5cff", width: bw }} />
              </View>
            </View>);

        })}
        <View style={styles.footerWrap}>
          <Muted>Suggestions: If you're over target, try 1-2 days of walking/cycling, public transport, or carpooling.</Muted>
        </View>
      </Card>
    </Screen>);

}

const styles = StyleSheet.create({
  weekSubtitle: {
    marginTop: 6
  },
  spacer: {
    height: 12
  },
  chartTitle: {
    fontSize: 18
  },
  chartSubtitle: {
    marginTop: 6
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dayLabel: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900"
  },
  barBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: 6
  },
  barFill: {
    height: "100%",
    backgroundColor: "#7c5cff"
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap"
  },
  barRow: {
    marginBottom: 10
  },
  kgLabel: {
    color: "rgba(255,255,255,0.68)",
    fontWeight: "900"
  },
  footerWrap: {
    marginTop: 8
  }
});