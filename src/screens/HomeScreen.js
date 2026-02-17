import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, computeDailyScore, computeWeeklyScore } from '../lib/co2';
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

    // Category breakdown
    const catTotals = { transport: 0, diet: 0, energy: 0, waste: 0 };
    for (const l of weekLogs) {
      catTotals[l.category || 'transport'] += l.co2Kg || 0;
    }

    // Today's score
    const todayLogs = logs.filter(
      (l) => new Date(l.dateISO).toISOString().slice(0, 10) === today
    );
    const todayKg = todayLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const todayScore = computeDailyScore(todayKg);

    // Weekly score
    const daily = {};
    for (const l of weekLogs) {
      const day = new Date(l.dateISO).toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + (l.co2Kg || 0);
    }
    const weeklyScore = computeWeeklyScore(Object.values(daily));

    // Streak
    const { currentStreak } = computeStreak(logs);

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
      recentLogs: logs.slice().sort((a, b) => (b.dateISO > a.dateISO ? 1 : -1)).slice(0, 6),
    };
  }, [state]);

  return (
    <Screen>
      <FlatList
        data={[1]}
        keyExtractor={() => 'home'}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View>
            {/* Score + Streak header */}
            <Card>
              <View style={styles.headerRow}>
                <View style={styles.scoreCircle}>
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

              {/* Quick category summary */}
              <View style={styles.catRow}>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <View key={key} style={styles.catMini}>
                    <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                    <Text style={[styles.catMiniKg, { color: cat.color }]}>
                      {(summary.catTotals[key] || 0).toFixed(1)}
                    </Text>
                    <Text style={styles.catMiniLabel}>kg</Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={{ height: 12 }} />

            {/* Action buttons */}
            <Card>
              <View style={{ gap: 10 }}>
                <Button label="+ Log Activity" onPress={() => navigation.navigate('LogActivity')} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Dashboard" onPress={() => navigation.navigate('Dashboard')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Tips" onPress={() => navigation.navigate('Tips')} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Badges" onPress={() => navigation.navigate('Badges')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button kind="ghost" label="Settings" onPress={() => navigation.navigate('Settings')} />
                  </View>
                </View>
              </View>
            </Card>

            <View style={{ height: 12 }} />

            {/* Weekly progress bar */}
            <Card>
              <View style={styles.progressHeader}>
                <Title style={{ fontSize: 16 }}>Weekly Target</Title>
                <Text style={styles.progressText}>
                  {summary.totalKg.toFixed(1)} / {summary.target.toFixed(0)} kg
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (summary.totalKg / summary.target) * 100)}%`,
                      backgroundColor: summary.over > 0 ? '#ef4444' : colors.brand,
                    },
                  ]}
                />
              </View>
              <Muted style={{ marginTop: 6, fontSize: 12 }}>
                {summary.over > 0
                  ? `Over target by ${summary.over.toFixed(1)} kg — check your tips for ideas!`
                  : `${summary.remaining.toFixed(1)} kg remaining this week`}
              </Muted>
            </Card>

            <View style={{ height: 12 }} />

            {/* Recent logs */}
            <Card>
              <Title style={{ fontSize: 16 }}>Recent Activity</Title>
              <View style={{ height: 8 }} />
              {summary.recentLogs.length === 0 ? (
                <Muted>No logs yet. Tap "+ Log Activity" to get started.</Muted>
              ) : (
                summary.recentLogs.map((item) => {
                  const catInfo = CATEGORIES[item.category || 'transport'];
                  return (
                    <View key={item.id} style={styles.logRow}>
                      <Text style={{ fontSize: 18, width: 28 }}>{catInfo?.icon || '🚗'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logTitle}>{item.label}</Text>
                        <Muted style={{ fontSize: 11 }}>
                          {new Date(item.dateISO).toLocaleDateString()} • {catInfo?.label || 'Transport'}
                          {item.quantity > 1 ? ` x${item.quantity}` : ''}
                        </Muted>
                      </View>
                      <Text style={[styles.logKg, { color: (item.co2Kg || 0) < 0 ? '#22c55e' : colors.text }]}>
                        {(item.co2Kg || 0) >= 0 ? '+' : ''}{(item.co2Kg || 0).toFixed(2)} kg
                      </Text>
                    </View>
                  );
                })
              )}
            </Card>

            <View style={{ marginTop: 14 }}>
              <Muted style={{ textAlign: 'center', fontSize: 11 }}>
                Educational estimates. Real emissions vary by region, vehicle, and habits.
              </Muted>
            </View>
            <View style={{ height: 20 }} />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  scoreNum: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900',
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  catMini: {
    alignItems: 'center',
  },
  catMiniKg: {
    fontWeight: '900',
    fontSize: 16,
    marginTop: 2,
  },
  catMiniLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 13,
  },
  progressBg: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  logTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  logKg: {
    fontWeight: '900',
    fontSize: 13,
  },
});
