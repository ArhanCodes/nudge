import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip, ProgressRing } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, computeDailyScore, computeWeeklyScore, compareToBenchmark, WEEKLY_BENCHMARKS } from '../lib/co2';
import { weekKeyISO, startOfWeekISO } from '../utils/time';
import { computeStreak } from '../lib/badges';

export default function HomeScreen({ navigation }) {
  const { state } = useContext(AppContext);

  const summary = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();
    const wk = weekKeyISO(now);
    const today = now.toISOString().slice(0, 10);

    const weekLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
    const totalKg = weekLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const target = state?.targetKgPerWeek ?? 10;


    const catTotals = { transport: 0, diet: 0, energy: 0, waste: 0 };
    for (const l of weekLogs) {
      catTotals[l.category || 'transport'] += l.co2Kg || 0;
    }


    const todayLogs = logs.filter(
      (l) => new Date(l.dateISO).toISOString().slice(0, 10) === today
    );
    const todayKg = todayLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const todayScore = computeDailyScore(todayKg);


    const daily = {};
    for (const l of weekLogs) {
      const day = new Date(l.dateISO).toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + (l.co2Kg || 0);
    }
    const weeklyScore = computeWeeklyScore(Object.values(daily));


    const { currentStreak } = computeStreak(logs);


    const hasLoggedToday = todayLogs.length > 0;


    const region = state?.region || 'world';
    const benchmark = compareToBenchmark(totalKg, region);

    return {
      weekStart: startOfWeekISO(now),
      totalKg,
      target,
      remaining: Math.max(0, target - totalKg),
      over: Math.max(0, totalKg - target),
      catTotals,
      todayScore,
      todayKg,
      weeklyScore,
      currentStreak,
      hasLoggedToday,
      benchmark,
      region,
      recentLogs: logs.slice().sort((a, b) => b.dateISO > a.dateISO ? 1 : -1).slice(0, 6)
    };
  }, [state]);

  return (
    <Screen>
      <FlatList
        data={[1]}
        keyExtractor={() => 'home'}
        showsVerticalScrollIndicator={false}
        renderItem={() =>
        <View>
            {}
            <Card>
              <View style={styles.headerRow}>
                <View
                style={styles.scoreCircle}
                accessibilityLabel={`Today's score: ${summary.todayScore} out of 100`}
                accessibilityRole="text">
                
                  <Text style={styles.scoreNum}>{summary.todayScore}</Text>
                  <Text style={styles.scoreLabel}>Today</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Title>Nudge</Title>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <Chip kind="brand" label={`${summary.totalKg.toFixed(1)} kg this week`} />
                    <Chip label={`${summary.currentStreak} day streak`} />
                  </View>
                </View>
              </View>

              {}
              {!summary.hasLoggedToday && summary.currentStreak > 0 &&
            <View style={styles.streakWarning} accessibilityRole="alert">
                  <Text style={styles.streakWarningText}>
                    Log an activity today to keep your {summary.currentStreak}-day streak!
                  </Text>
                </View>
            }

              {}
              <View style={styles.catRow}>
                {Object.entries(CATEGORIES).map(([key, cat]) =>
              <View
                key={key}
                style={styles.catMini}
                accessibilityLabel={`${cat.label}: ${(summary.catTotals[key] || 0).toFixed(1)} kilograms`}>
                
                    <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                    <Text style={[styles.catMiniKg, { color: cat.color }]}>
                      {(summary.catTotals[key] || 0).toFixed(1)}
                    </Text>
                    <Text style={styles.catMiniLabel}>kg</Text>
                  </View>
              )}
              </View>
            </Card>

            <View style={{ height: 12 }} />

            {}
            <Card>
              <View style={{ gap: 10 }}>
                <Button label="+ Log Activity" onPress={() => navigation.navigate('LogActivity')} accessibilityLabel="Log a new activity" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Dashboard" onPress={() => navigation.navigate('Dashboard')} accessibilityLabel="View progress dashboard" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Tips" onPress={() => navigation.navigate('Tips')} accessibilityLabel="View weekly tips" />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Badges" onPress={() => navigation.navigate('Badges')} accessibilityLabel="View badges and streaks" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Settings" onPress={() => navigation.navigate('Settings')} accessibilityLabel="Open settings" />
                  </View>
                </View>
                <Button kind="ghost" label="Export Data" onPress={() => navigation.navigate('Export')} accessibilityLabel="Export data as CSV" />
              </View>
            </Card>

            <View style={{ height: 12 }} />

            {}
            <Card>
              <Title style={{ fontSize: 16, textAlign: 'center', marginBottom: 12 }}>Weekly Goal</Title>
              <View style={{ alignItems: 'center' }}>
                <ProgressRing
                progress={Math.min(summary.totalKg / summary.target, 1)}
                size={140}
                strokeWidth={12}
                color={summary.over > 0 ? '#ef4444' : colors.brand}>
                
                  <Text style={styles.ringMainText}>
                    {summary.totalKg.toFixed(1)}
                  </Text>
                  <Text style={styles.ringSubText}>
                    / {summary.target.toFixed(0)} kg
                  </Text>
                </ProgressRing>
              </View>
              <Muted style={{ marginTop: 10, fontSize: 12, textAlign: 'center' }}>
                {summary.over > 0 ?
              `Over target by ${summary.over.toFixed(1)} kg — check your tips for ideas!` :
              `${summary.remaining.toFixed(1)} kg remaining this week`}
              </Muted>
            </Card>

            <View style={{ height: 12 }} />

            {}
            <Card>
              <Title style={{ fontSize: 16 }}>vs {summary.benchmark.benchmarkLabel}</Title>
              <View style={styles.benchmarkRow}>
                <View style={styles.benchmarkCol}>
                  <Text style={styles.benchmarkYou}>{summary.totalKg.toFixed(1)} kg</Text>
                  <Muted style={{ fontSize: 11 }}>You this week</Muted>
                </View>
                <View style={styles.benchmarkVs}>
                  <Text style={{ color: colors.muted, fontWeight: '900', fontSize: 12 }}>vs</Text>
                </View>
                <View style={styles.benchmarkCol}>
                  <Text style={styles.benchmarkAvg}>{summary.benchmark.benchmarkKg} kg</Text>
                  <Muted style={{ fontSize: 11 }}>National avg</Muted>
                </View>
              </View>

              {}
              <View style={[
            styles.benchmarkBanner,
            { backgroundColor: summary.benchmark.better ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' },
            { borderColor: summary.benchmark.better ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }]
            }>
                <Text style={[
              styles.benchmarkBannerText,
              { color: summary.benchmark.better ? '#22c55e' : '#ef4444' }]
              }>
                  {summary.benchmark.better ?
                `🎉 You saved ${summary.benchmark.savedKg.toFixed(1)} kg (${Math.abs(summary.benchmark.savedPct).toFixed(0)}% less) vs the ${summary.benchmark.benchmarkLabel}` :
                `📈 ${Math.abs(summary.benchmark.savedKg).toFixed(1)} kg above the ${summary.benchmark.benchmarkLabel} — small changes add up!`}
                </Text>
              </View>

              <Muted style={{ marginTop: 6, fontSize: 10 }}>
                Source: {summary.benchmark.benchmarkSource}
              </Muted>
            </Card>

            <View style={{ height: 12 }} />

            {}
            <Card>
              <Title style={{ fontSize: 16 }}>Recent Activity</Title>
              <View style={{ height: 8 }} />
              {summary.recentLogs.length === 0 ?
            <Muted>No logs yet. Tap "+ Log Activity" to get started.</Muted> :

            summary.recentLogs.map((item) => {
              const catInfo = CATEGORIES[item.category || 'transport'];
              return (
                <View
                  key={item.id}
                  style={styles.logRow}
                  accessibilityLabel={`${item.label}, ${(item.co2Kg || 0).toFixed(2)} kg CO2, ${catInfo?.label || 'Transport'}`}>
                  
                      <Text style={{ fontSize: 18, width: 28 }}>{catInfo?.icon || ''}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logTitle}>{item.label}</Text>
                        <Muted style={{ fontSize: 11 }}>
                          {new Date(item.dateISO).toLocaleDateString()} {catInfo?.label || 'Transport'}
                          {item.quantity > 1 ? ` x${item.quantity}` : ''}
                        </Muted>
                      </View>
                      <Text style={[styles.logKg, { color: (item.co2Kg || 0) < 0 ? '#22c55e' : colors.text }]}>
                        {(item.co2Kg || 0) >= 0 ? '+' : ''}{(item.co2Kg || 0).toFixed(2)} kg
                      </Text>
                    </View>);

            })
            }
            </Card>

            <View style={{ marginTop: 14 }}>
              <Muted style={{ textAlign: 'center', fontSize: 11 }}>
                Educational estimates. Real emissions vary by region, vehicle, and habits.
              </Muted>
            </View>
            <View style={{ height: 20 }} />
          </View>
        } />
      
    </Screen>);

}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.08)'
  },
  scoreNum: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900'
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700'
  },
  streakWarning: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10
  },
  streakWarningText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center'
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  catMini: {
    alignItems: 'center'
  },
  catMiniKg: {
    fontWeight: '900',
    fontSize: 16,
    marginTop: 2
  },
  catMiniLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700'
  },
  ringMainText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900'
  },
  ringSubText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700'
  },
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  benchmarkCol: {
    flex: 1,
    alignItems: 'center'
  },
  benchmarkVs: {
    paddingHorizontal: 12
  },
  benchmarkYou: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900'
  },
  benchmarkAvg: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: '900'
  },
  benchmarkBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10
  },
  benchmarkBannerText: {
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center'
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8
  },
  logTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14
  },
  logKg: {
    fontWeight: '900',
    fontSize: 13
  }
});