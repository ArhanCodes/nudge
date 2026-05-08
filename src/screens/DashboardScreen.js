import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip, ProgressRing, Spacer } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, computeDailyScore, computeWeeklyScore, compareToBenchmark } from '../lib/co2';
import { weekKeyISO, startOfWeekISO, addDaysISO } from '../utils/time';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

function Bar({ label, kg, max, barColor, isHighlight }) {
  const pct = clamp((kg / max) * 100, 0, 100);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <Text style={[styles.label, isHighlight && { color: colors.brand }]}>{label}</Text>
        <Text style={styles.kg}>{kg.toFixed(1)} kg</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

function scoreColor(score) {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.danger;
}

export default function DashboardScreen() {
  const { state } = useContext(AppContext);

  const data = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();

    const weeks = Array.from({ length: 4 }).map((_, w) => {
      const d = new Date(now);
      d.setDate(d.getDate() - w * 7);
      const wk = weekKeyISO(d);
      const weekLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
      const totalKg = weekLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);

      const catTotals = { transport: 0, diet: 0, energy: 0, waste: 0 };
      const daily = {};
      for (const l of weekLogs) {
        catTotals[l.category || 'transport'] += l.co2Kg || 0;
        daily[dayKey(l.dateISO)] = (daily[dayKey(l.dateISO)] || 0) + (l.co2Kg || 0);
      }

      return {
        wk,
        startISO: startOfWeekISO(d),
        totalKg,
        catTotals,
        weeklyScore: computeWeeklyScore(Object.values(daily)),
        logCount: weekLogs.length,
      };
    });

    const currentStart = startOfWeekISO(now);
    const currentWk = weekKeyISO(now);
    const dailyBreakdown = Array.from({ length: 7 }).map((_, i) => {
      const dayISO = addDaysISO(currentStart, i);
      const dayLogs = logs.filter(
        (l) => weekKeyISO(new Date(l.dateISO)) === currentWk && dayKey(l.dateISO) === dayISO
      );
      const kg = dayLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);
      return { dayISO, kg, score: computeDailyScore(kg) };
    });

    return {
      weeks,
      dailyBreakdown,
      benchmark: compareToBenchmark(weeks[0]?.totalKg || 0, state?.region || 'world'),
      target: state?.targetKgPerWeek ?? 10,
    };
  }, [state]);

  const thisWeek = data.weeks[0];
  const lastWeek = data.weeks[1];
  const today = dayKey(new Date());
  const maxWeeklyKg = Math.max(1, ...data.weeks.map((w) => w.totalKg));
  const maxDailyKg = Math.max(1, ...data.dailyBreakdown.map((d) => d.kg));
  const improvement = lastWeek?.totalKg > 0
    ? ((lastWeek.totalKg - thisWeek.totalKg) / lastWeek.totalKg * 100).toFixed(0)
    : null;
  const ringPct = Math.round(Math.min((thisWeek.totalKg / data.target) * 100, 999));
  const better = data.benchmark.better;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.row}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{thisWeek.weeklyScore}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Title>This Week</Title>
              <Muted style={{ marginTop: 4 }}>
                {thisWeek.totalKg.toFixed(1)} kg CO₂e from {thisWeek.logCount} activities
              </Muted>
              {improvement !== null && (
                <View style={{ marginTop: 6 }}>
                  <Chip
                    kind={Number(improvement) > 0 ? 'brand' : 'default'}
                    label={
                      Number(improvement) > 0
                        ? `${improvement}% better than last week`
                        : `${Math.abs(improvement)}% more than last week`
                    }
                  />
                </View>
              )}
            </View>
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.section}>Goal & Benchmark</Title>
          <View style={styles.goalRow}>
            <ProgressRing
              progress={Math.min(thisWeek.totalKg / data.target, 1)}
              size={100}
              strokeWidth={10}
              color={thisWeek.totalKg > data.target ? colors.danger : colors.brand}
            >
              <Text style={styles.ringText}>{ringPct}%</Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalText}>
                {thisWeek.totalKg.toFixed(1)} / {data.target} kg goal
              </Text>
              <Spacer h={6} />
              <Text style={[styles.benchText, { color: better ? colors.success : colors.danger }]}>
                {better
                  ? `${data.benchmark.savedPct.toFixed(0)}% below ${data.benchmark.benchmarkLabel}`
                  : `${Math.abs(data.benchmark.savedPct).toFixed(0)}% above ${data.benchmark.benchmarkLabel}`}
              </Text>
              <Muted style={{ fontSize: 11, marginTop: 2 }}>
                National avg: {data.benchmark.benchmarkKg} kg/week
              </Muted>
              <Muted style={{ fontSize: 9, marginTop: 2 }}>Source: {data.benchmark.benchmarkSource}</Muted>
            </View>
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.section}>Category Breakdown</Title>
          <Muted style={{ marginTop: 4 }}>This week's CO₂e by domain</Muted>
          <View style={{ marginTop: 12 }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Bar
                key={key}
                label={`${cat.icon} ${cat.label}`}
                kg={thisWeek.catTotals[key] || 0}
                max={Math.max(0.01, thisWeek.totalKg)}
                barColor={cat.color}
              />
            ))}
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.section}>Daily Emissions</Title>
          <Muted style={{ marginTop: 4 }}>CO₂e per day this week</Muted>
          <View style={{ marginTop: 12 }}>
            {data.dailyBreakdown.map((d) => {
              const dayLabel = new Date(d.dayISO + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short' });
              const isToday = d.dayISO === today;
              return (
                <View key={d.dayISO} style={{ marginBottom: 8 }}>
                  <View style={styles.row}>
                    <Text style={[styles.label, isToday && { color: colors.brand }]}>
                      {dayLabel}{isToday ? ' (today)' : ''}
                    </Text>
                    <Text style={styles.kg}>{d.kg > 0 ? `${d.kg.toFixed(2)} kg` : '—'}</Text>
                    <View style={styles.scoreBadge}>
                      <Text style={[styles.scoreBadgeText, { color: scoreColor(d.score) }]}>
                        {d.kg > 0 ? d.score : '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${clamp((d.kg / maxDailyKg) * 100, 0, 100)}%`, backgroundColor: colors.brand2 }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.section}>4-Week Trend</Title>
          <Muted style={{ marginTop: 4 }}>Total CO₂e over recent weeks</Muted>
          <View style={{ marginTop: 12 }}>
            {data.weeks.slice().reverse().map((w, i) => (
              <Bar
                key={w.wk}
                label={`${w.startISO}${i === 3 ? ' (current)' : ''}`}
                kg={w.totalKg}
                max={maxWeeklyKg}
                barColor={i === 3 ? colors.brand : 'rgba(255,255,255,0.2)'}
                isHighlight={i === 3}
              />
            ))}
          </View>
        </Card>

        <Spacer h={30} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  section: { fontSize: 18 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 16 },
  goalText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  benchText: { fontWeight: '700', fontSize: 13 },
  ringText: { color: colors.text, fontSize: 18, fontWeight: '900' },
  scoreCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    borderColor: colors.brand, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  scoreNumber: { color: colors.brand, fontSize: 28, fontWeight: '900' },
  scoreLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  barBg: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  label: { color: colors.text, fontWeight: '700', fontSize: 13, flex: 1 },
  kg: { color: colors.muted, fontWeight: '900', fontSize: 12, marginRight: 8 },
  scoreBadge: { width: 30, alignItems: 'flex-end' },
  scoreBadgeText: { fontWeight: '900', fontSize: 13 },
});
