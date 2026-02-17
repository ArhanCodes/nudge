import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Chip } from '../ui/components';
import { colors } from '../ui/theme';
import { computeWeeklyScore } from '../lib/co2';
import { weekKeyISO } from '../utils/time';
import { BADGES, computeStats, computeStreak, getEarnedBadges, getNextBadge } from '../lib/badges';

export default function BadgesScreen() {
  const { state } = useContext(AppContext);

  const { earned, nextBadge, streakInfo, stats } = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();
    const thisWk = weekKeyISO(now);
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - 7);
    const prevWk = weekKeyISO(prevDate);

    // Compute weekly scores
    const weekScore = (wk) => {
      const wLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
      const daily = {};
      for (const l of wLogs) {
        const day = new Date(l.dateISO).toISOString().slice(0, 10);
        daily[day] = (daily[day] || 0) + (l.co2Kg || 0);
      }
      return computeWeeklyScore(Object.values(daily));
    };

    const thisScore = weekScore(thisWk);
    const prevScore = weekScore(prevWk);

    const s = computeStats(logs, thisScore, prevScore);
    const e = getEarnedBadges(s);
    const n = getNextBadge(s);
    const streak = computeStreak(logs);

    return { earned: e, nextBadge: n, streakInfo: streak, stats: s };
  }, [state]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak card */}
        <Card>
          <View style={styles.streakRow}>
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{streakInfo.currentStreak}</Text>
              <Text style={styles.streakUnit}>day{streakInfo.currentStreak !== 1 ? 's' : ''}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Title>Current Streak</Title>
              <Muted style={{ marginTop: 4 }}>
                Longest streak: {streakInfo.longestStreak} days
              </Muted>
              <Muted>Total activities logged: {stats.totalLogs}</Muted>
            </View>
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {/* Earned badges */}
        <Card>
          <Title style={{ fontSize: 18 }}>
            Badges Earned ({earned.length}/{BADGES.length})
          </Title>
          <Muted style={{ marginTop: 4 }}>Complete challenges to unlock badges</Muted>

          <View style={{ height: 12 }} />

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

        <View style={{ height: 12 }} />

        {/* Next badge */}
        {nextBadge && (
          <Card style={{ borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' }}>
            <Title style={{ fontSize: 16 }}>Next Badge</Title>
            <View style={styles.nextBadgeRow}>
              <Text style={{ fontSize: 40 }}>{nextBadge.icon}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nextBadgeName}>{nextBadge.name}</Text>
                <Text style={styles.nextBadgeDesc}>{nextBadge.desc}</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={{ height: 12 }} />

        {/* All badges overview */}
        <Card>
          <Title style={{ fontSize: 16 }}>All Badges</Title>
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  streakNumber: {
    color: '#f59e0b',
    fontSize: 28,
    fontWeight: '900',
  },
  streakUnit: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '47%',
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  badgeName: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
  },
  badgeDesc: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  nextBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nextBadgeName: {
    color: colors.brand,
    fontWeight: '900',
    fontSize: 16,
  },
  nextBadgeDesc: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  allBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  allBadgeName: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 14,
  },
  allBadgeDesc: {
    color: colors.muted,
    fontSize: 12,
  },
});
