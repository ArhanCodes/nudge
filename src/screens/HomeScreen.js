import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip, ProgressRing, Spacer } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES, computeDailyScore, compareToBenchmark } from '../lib/co2';
import { weekKeyISO } from '../utils/time';
import { computeStreak } from '../lib/badges';

const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

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
    for (const l of weekLogs) catTotals[l.category || 'transport'] += l.co2Kg || 0;

    const todayLogs = logs.filter((l) => dayKey(l.dateISO) === today);
    const todayKg = todayLogs.reduce((a, l) => a + (l.co2Kg || 0), 0);

    return {
      totalKg,
      target,
      remaining: Math.max(0, target - totalKg),
      over: Math.max(0, totalKg - target),
      catTotals,
      todayScore: computeDailyScore(todayKg),
      currentStreak: computeStreak(logs).currentStreak,
      hasLoggedToday: todayLogs.length > 0,
      benchmark: compareToBenchmark(totalKg, state?.region || 'world'),
      recentLogs: logs.slice().sort((a, b) => (b.dateISO > a.dateISO ? 1 : -1)).slice(0, 6),
    };
  }, [state]);

  const goto = (screen) => () => navigation.navigate(screen);
  const ringColor = summary.over > 0 ? colors.danger : colors.brand;
  const better = summary.benchmark.better;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.headerRow}>
            <View style={styles.scoreCircle} accessibilityLabel={`Today's score: ${summary.todayScore} out of 100`}>
              <Text style={styles.scoreNum}>{summary.todayScore}</Text>
              <Text style={styles.scoreLabel}>Today</Text>
            </View>
            <View style={styles.headerMeta}>
              <Title>Nudge</Title>
              <View style={styles.chipRow}>
                <Chip kind="brand" label={`${summary.totalKg.toFixed(1)} kg this week`} />
                <Chip label={`${summary.currentStreak} day streak`} />
              </View>
            </View>
          </View>

          {!summary.hasLoggedToday && summary.currentStreak > 0 && (
            <View style={styles.streakWarning} accessibilityRole="alert">
              <Text style={styles.streakWarningText}>
                Log an activity today to keep your {summary.currentStreak}-day streak!
              </Text>
            </View>
          )}

          <View style={styles.catRow}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <View key={key} style={styles.catMini}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catMiniKg, { color: cat.color }]}>
                  {(summary.catTotals[key] || 0).toFixed(1)}
                </Text>
                <Text style={styles.catMiniLabel}>kg</Text>
              </View>
            ))}
          </View>
        </Card>

        <Spacer />
        <Card>
          <View style={{ gap: 10 }}>
            <Button label="+ Log Activity" onPress={goto('LogActivity')} />
            <View style={styles.btnRow}>
              <View style={styles.btnHalf}><Button kind="ghost" label="Dashboard" onPress={goto('Dashboard')} /></View>
              <View style={styles.btnHalf}><Button kind="ghost" label="Tips" onPress={goto('Tips')} /></View>
            </View>
            <View style={styles.btnRow}>
              <View style={styles.btnHalf}><Button kind="ghost" label="Badges" onPress={goto('Badges')} /></View>
              <View style={styles.btnHalf}><Button kind="ghost" label="Settings" onPress={goto('Settings')} /></View>
            </View>
            <Button kind="ghost" label="Export Data" onPress={goto('Export')} />
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.cardTitle}>Weekly Goal</Title>
          <View style={styles.center}>
            <ProgressRing
              progress={Math.min(summary.totalKg / summary.target, 1)}
              size={140}
              strokeWidth={12}
              color={ringColor}
            >
              <Text style={styles.ringMainText}>{summary.totalKg.toFixed(1)}</Text>
              <Text style={styles.ringSubText}>/ {summary.target.toFixed(0)} kg</Text>
            </ProgressRing>
          </View>
          <Muted style={styles.goalNote}>
            {summary.over > 0
              ? `Over target by ${summary.over.toFixed(1)} kg — check your tips for ideas!`
              : `${summary.remaining.toFixed(1)} kg remaining this week`}
          </Muted>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.cardSubTitle}>vs {summary.benchmark.benchmarkLabel}</Title>
          <View style={styles.benchmarkRow}>
            <View style={styles.benchmarkCol}>
              <Text style={styles.benchmarkYou}>{summary.totalKg.toFixed(1)} kg</Text>
              <Muted style={{ fontSize: 11 }}>You this week</Muted>
            </View>
            <Text style={styles.benchmarkVs}>vs</Text>
            <View style={styles.benchmarkCol}>
              <Text style={styles.benchmarkAvg}>{summary.benchmark.benchmarkKg} kg</Text>
              <Muted style={{ fontSize: 11 }}>National avg</Muted>
            </View>
          </View>
          <View
            style={[
              styles.benchmarkBanner,
              {
                backgroundColor: better ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                borderColor: better ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
              },
            ]}
          >
            <Text style={[styles.benchmarkBannerText, { color: better ? colors.success : colors.danger }]}>
              {better
                ? `🎉 You saved ${summary.benchmark.savedKg.toFixed(1)} kg (${Math.abs(summary.benchmark.savedPct).toFixed(0)}% less) vs the ${summary.benchmark.benchmarkLabel}`
                : `📈 ${Math.abs(summary.benchmark.savedKg).toFixed(1)} kg above the ${summary.benchmark.benchmarkLabel} — small changes add up!`}
            </Text>
          </View>
          <Muted style={styles.source}>Source: {summary.benchmark.benchmarkSource}</Muted>
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.cardSubTitle}>Recent Activity</Title>
          <Spacer h={8} />
          {summary.recentLogs.length === 0 ? (
            <Muted>No logs yet. Tap "+ Log Activity" to get started.</Muted>
          ) : (
            summary.recentLogs.map((item) => {
              const cat = CATEGORIES[item.category || 'transport'];
              const co2 = item.co2Kg || 0;
              return (
                <View key={item.id} style={styles.logRow}>
                  <Text style={styles.logIcon}>{cat?.icon || ''}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logTitle}>{item.label}</Text>
                    <Muted style={{ fontSize: 11 }}>
                      {new Date(item.dateISO).toLocaleDateString()} {cat?.label || 'Transport'}
                      {item.quantity > 1 ? ` x${item.quantity}` : ''}
                    </Muted>
                  </View>
                  <Text style={[styles.logKg, { color: co2 < 0 ? colors.success : colors.text }]}>
                    {co2 >= 0 ? '+' : ''}{co2.toFixed(2)} kg
                  </Text>
                </View>
              );
            })
          )}
        </Card>

        <Muted style={styles.footer}>
          Educational estimates. Real emissions vary by region, vehicle, and habits.
        </Muted>
        <Spacer h={20} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerMeta: { flex: 1, marginLeft: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  center: { alignItems: 'center' },
  cardTitle: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
  cardSubTitle: { fontSize: 16 },
  goalNote: { marginTop: 10, fontSize: 12, textAlign: 'center' },
  source: { marginTop: 6, fontSize: 10 },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnHalf: { flex: 1 },
  scoreCircle: {
    width: 68, height: 68, borderRadius: 34, borderWidth: 3,
    borderColor: colors.brand, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  scoreNum: { color: colors.brand, fontSize: 22, fontWeight: '900' },
  scoreLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  streakWarning: {
    backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)', borderRadius: 10, padding: 10, marginTop: 10,
  },
  streakWarningText: { color: colors.warning, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  catRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  catMini: { alignItems: 'center' },
  catIcon: { fontSize: 18 },
  catMiniKg: { fontWeight: '900', fontSize: 16, marginTop: 2 },
  catMiniLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  ringMainText: { color: colors.text, fontSize: 26, fontWeight: '900' },
  ringSubText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  benchmarkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  benchmarkCol: { flex: 1, alignItems: 'center' },
  benchmarkVs: { color: colors.muted, fontWeight: '900', fontSize: 12, paddingHorizontal: 12 },
  benchmarkYou: { color: colors.brand, fontSize: 22, fontWeight: '900' },
  benchmarkAvg: { color: colors.muted, fontSize: 22, fontWeight: '900' },
  benchmarkBanner: { borderWidth: 1, borderRadius: 10, padding: 10 },
  benchmarkBannerText: { fontWeight: '700', fontSize: 13, textAlign: 'center' },
  logRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
  },
  logIcon: { fontSize: 18, width: 28 },
  logTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  logKg: { fontWeight: '900', fontSize: 13 },
});
