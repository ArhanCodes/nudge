import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, computeDailyScore, computeWeeklyScore } from '../lib/co2';
import { weekKeyISO, startOfWeekISO, addDaysISO } from '../utils/time';

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function DashboardScreen() {
  const { state } = useContext(AppContext);

  const data = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();

    // Build last 4 weeks of data
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const d = new Date(now);
      d.setDate(d.getDate() - w * 7);
      const wk = weekKeyISO(d);
      const startISO = startOfWeekISO(d);

      const weekLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
      const totalKg = weekLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);

      // Category breakdown
      const catTotals = { transport: 0, diet: 0, energy: 0, waste: 0 };
      for (const l of weekLogs) {
        const cat = l.category || 'transport';
        catTotals[cat] = (catTotals[cat] || 0) + (l.co2Kg || 0);
      }

      // Daily totals for score
      const daily = {};
      for (const l of weekLogs) {
        const day = new Date(l.dateISO).toISOString().slice(0, 10);
        daily[day] = (daily[day] || 0) + (l.co2Kg || 0);
      }
      const dailyTotals = Object.values(daily);
      const weeklyScore = computeWeeklyScore(dailyTotals);

      weeks.push({ wk, startISO, totalKg, catTotals, weeklyScore, logCount: weekLogs.length });
    }

    // Current week daily breakdown
    const currentWk = weekKeyISO(now);
    const currentStart = startOfWeekISO(now);
    const dailyBreakdown = Array.from({ length: 7 }).map((_, i) => {
      const dayISO = addDaysISO(currentStart, i);
      const dayLogs = logs.filter(
        (l) => weekKeyISO(new Date(l.dateISO)) === currentWk &&
          new Date(l.dateISO).toISOString().slice(0, 10) === dayISO
      );
      const kg = dayLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);
      return { dayISO, kg, score: computeDailyScore(kg) };
    });

    return { weeks, dailyBreakdown };
  }, [state]);

  const thisWeek = data.weeks[0];
  const lastWeek = data.weeks[1];
  const maxWeeklyKg = Math.max(1, ...data.weeks.map((w) => w.totalKg));
  const maxDailyKg = Math.max(1, ...data.dailyBreakdown.map((d) => d.kg));

  const improvement = lastWeek?.totalKg > 0
    ? ((lastWeek.totalKg - thisWeek.totalKg) / lastWeek.totalKg * 100).toFixed(0)
    : null;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score card */}
        <Card>
          <View style={styles.scoreRow}>
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
                    label={Number(improvement) > 0 ? `${improvement}% better than last week` : `${Math.abs(improvement)}% more than last week`}
                  />
                </View>
              )}
            </View>
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Category breakdown */}
        <Card>
          <Title style={{ fontSize: 18 }}>Category Breakdown</Title>
          <Muted style={{ marginTop: 4 }}>This week's CO₂e by domain</Muted>
          <View style={{ marginTop: 12 }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const kg = thisWeek.catTotals[key] || 0;
              const totalKg = Math.max(0.01, thisWeek.totalKg);
              const pct = (kg / totalKg) * 100;
              return (
                <View key={key} style={{ marginBottom: 12 }}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catName}>{cat.icon} {cat.label}</Text>
                    <Text style={styles.catKg}>{kg.toFixed(2)} kg</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${clamp(pct, 0, 100)}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Daily chart */}
        <Card>
          <Title style={{ fontSize: 18 }}>Daily Emissions</Title>
          <Muted style={{ marginTop: 4 }}>CO₂e per day this week</Muted>
          <View style={{ marginTop: 12 }}>
            {data.dailyBreakdown.map((d) => {
              const pct = (d.kg / maxDailyKg) * 100;
              const dayLabel = new Date(d.dayISO + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short' });
              const isToday = d.dayISO === new Date().toISOString().slice(0, 10);
              return (
                <View key={d.dayISO} style={{ marginBottom: 8 }}>
                  <View style={styles.dayRow}>
                    <Text style={[styles.dayLabel, isToday && { color: colors.brand }]}>
                      {dayLabel}{isToday ? ' (today)' : ''}
                    </Text>
                    <Text style={styles.dayKg}>
                      {d.kg > 0 ? `${d.kg.toFixed(2)} kg` : '—'}
                    </Text>
                    <View style={styles.dayScoreBadge}>
                      <Text style={[styles.dayScoreText, { color: d.score >= 70 ? '#22c55e' : d.score >= 40 ? '#f59e0b' : '#ef4444' }]}>
                        {d.kg > 0 ? d.score : '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${clamp(pct, 0, 100)}%`, backgroundColor: colors.brand2 }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Weekly trend */}
        <Card>
          <Title style={{ fontSize: 18 }}>4-Week Trend</Title>
          <Muted style={{ marginTop: 4 }}>Total CO₂e over recent weeks</Muted>
          <View style={{ marginTop: 12 }}>
            {data.weeks.slice().reverse().map((w, i) => {
              const pct = (w.totalKg / maxWeeklyKg) * 100;
              return (
                <View key={w.wk} style={{ marginBottom: 10 }}>
                  <View style={styles.dayRow}>
                    <Text style={[styles.dayLabel, i === 3 && { color: colors.brand }]}>
                      {w.startISO}{i === 3 ? ' (current)' : ''}
                    </Text>
                    <Text style={styles.dayKg}>{w.totalKg.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${clamp(pct, 0, 100)}%`,
                          backgroundColor: i === 3 ? colors.brand : 'rgba(255,255,255,0.2)',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  scoreNumber: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: '900',
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  catKg: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 13,
  },
  barBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  dayKg: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 12,
    marginRight: 8,
  },
  dayScoreBadge: {
    width: 30,
    alignItems: 'flex-end',
  },
  dayScoreText: {
    fontWeight: '900',
    fontSize: 13,
  },
});
