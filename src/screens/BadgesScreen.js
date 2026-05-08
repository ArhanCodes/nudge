import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip, Spacer } from '../ui/components';
import { colors } from '../ui/theme';
import { computeWeeklyScore } from '../lib/co2';
import { weekKeyISO } from '../utils/time';
import { BADGES, computeStats, computeStreak, getEarnedBadges, getNextBadge } from '../lib/badges';

const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

export default function BadgesScreen() {
  const { state } = useContext(AppContext);

  const { earned, nextBadge, streakInfo, stats } = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();
    const prev = new Date(now);
    prev.setDate(prev.getDate() - 7);

    const weekScore = (wk) => {
      const wLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
      const daily = {};
      for (const l of wLogs) daily[dayKey(l.dateISO)] = (daily[dayKey(l.dateISO)] || 0) + (l.co2Kg || 0);
      return computeWeeklyScore(Object.values(daily));
    };

    const s = computeStats(logs, weekScore(weekKeyISO(now)), weekScore(weekKeyISO(prev)));
    return {
      earned: getEarnedBadges(s),
      nextBadge: getNextBadge(s),
      streakInfo: computeStreak(logs),
      stats: s,
    };
  }, [state]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.row}>
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{streakInfo.currentStreak}</Text>
              <Text style={styles.streakUnit}>day{streakInfo.currentStreak !== 1 ? 's' : ''}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Title>Current Streak</Title>
              <Muted style={{ marginTop: 4 }}>Longest streak: {streakInfo.longestStreak} days</Muted>
              <Muted>Total activities logged: {stats.totalLogs}</Muted>
            </View>
          </View>
          {streakInfo.currentStreak > 0 && (
            <View style={styles.graceNote}>
              <Muted style={{ fontSize: 12, textAlign: 'center' }}>
                Streaks include a 1-day grace period — if you miss today, you have until tomorrow to log and keep your streak alive.
              </Muted>
            </View>
          )}
        </Card>

        <Spacer />
        <Card>
          <Title style={styles.section}>Badges Earned ({earned.length}/{BADGES.length})</Title>
          <Muted style={{ marginTop: 4 }}>Complete challenges to unlock badges</Muted>
          <Spacer />
          {earned.length > 0 ? (
            <View style={styles.badgeGrid}>
              {earned.map((b) => (
                <View key={b.id} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{b.icon}</Text>
                  <Text style={styles.badgeName}>{b.name}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Muted>No badges yet. Start logging activities to earn them!</Muted>
          )}
        </Card>

        <Spacer />
        {nextBadge && (
          <Card style={{ borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' }}>
            <Title style={styles.nextTitle}>Next Badge</Title>
            <View style={styles.nextBadgeRow}>
              <Text style={{ fontSize: 40 }}>{nextBadge.icon}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nextBadgeName}>{nextBadge.name}</Text>
                <Text style={styles.nextBadgeDesc}>{nextBadge.desc}</Text>
              </View>
            </View>
          </Card>
        )}

        <Spacer />
        <Card>
          <Title style={styles.nextTitle}>All Badges</Title>
          <View style={{ marginTop: 10 }}>
            {BADGES.map((b) => {
              const isEarned = earned.some((e) => e.id === b.id);
              return (
                <View key={b.id} style={[styles.allBadgeRow, !isEarned && { opacity: 0.4 }]}>
                  <Text style={{ fontSize: 24, width: 36 }}>{b.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.allBadgeName}>{b.name}</Text>
                    <Text style={styles.allBadgeDesc}>{b.desc}</Text>
                  </View>
                  {isEarned && <Chip kind="brand" label="Earned" />}
                </View>
              );
            })}
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
  nextTitle: { fontSize: 16 },
  streakCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    borderColor: colors.warning, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  streakNumber: { color: colors.warning, fontSize: 28, fontWeight: '900' },
  streakUnit: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, alignItems: 'center', width: '47%',
  },
  badgeIcon: { fontSize: 36, marginBottom: 6 },
  badgeName: { color: colors.text, fontWeight: '900', fontSize: 13, textAlign: 'center' },
  badgeDesc: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 2 },
  nextBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  nextBadgeName: { color: colors.brand, fontWeight: '900', fontSize: 16 },
  nextBadgeDesc: { color: colors.muted, fontSize: 13, marginTop: 2 },
  allBadgeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
  },
  allBadgeName: { color: colors.text, fontWeight: '900', fontSize: 14 },
  allBadgeDesc: { color: colors.muted, fontSize: 12 },
  graceNote: { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: 10, marginTop: 12 },
});
