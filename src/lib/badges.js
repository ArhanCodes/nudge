// Gamification: badges, streaks, and stats.
// A badge is earned when its `check` function returns true for the user's stats.

export const BADGES = [
  { id: 'first_log', name: 'First Step', desc: 'Log your first activity', icon: '🌱',
    check: (s) => s.totalLogs >= 1 },
  { id: 'week_streak_3', name: 'Consistent', desc: '3-day logging streak', icon: '🔥',
    check: (s) => s.currentStreak >= 3 },
  { id: 'week_streak_7', name: 'Full Week', desc: '7-day logging streak', icon: '⭐',
    check: (s) => s.currentStreak >= 7 },
  { id: 'week_streak_14', name: 'Fortnight Hero', desc: '14-day logging streak', icon: '🏅',
    check: (s) => s.currentStreak >= 14 },
  { id: 'week_streak_30', name: 'Monthly Master', desc: '30-day logging streak', icon: '🏆',
    check: (s) => s.currentStreak >= 30 },
  { id: 'low_carbon_day', name: 'Green Day', desc: 'Score 80+ on any day', icon: '💚',
    check: (s) => s.bestDailyScore >= 80 },
  { id: 'perfect_day', name: 'Perfect Day', desc: 'Score 100 on a day', icon: '🌟',
    check: (s) => s.bestDailyScore >= 100 },
  { id: 'all_categories', name: 'Well-Rounded', desc: 'Log in all 4 categories in one day', icon: '🎯',
    check: (s) => s.hasLoggedAll4InOneDay },
  { id: 'fifty_logs', name: 'Dedicated', desc: 'Log 50 activities total', icon: '📊',
    check: (s) => s.totalLogs >= 50 },
  { id: 'improvement', name: 'Improver', desc: 'Weekly score improved over last week', icon: '📈',
    check: (s) => s.weeklyImproved },
];

const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

// Counts consecutive days the user has logged something, working backwards
// from today. Includes a 1-day "grace period" — if today has no log yet, we
// allow yesterday to count as the streak's tip so the user doesn't lose the
// streak before the day is even over.
export function computeStreak(logs) {
  if (!logs.length) return { currentStreak: 0, longestStreak: 0 };

  // All distinct days the user has logged at least one activity.
  const days = new Set(logs.map((l) => dayKey(l.dateISO)));
  const sorted = [...days].sort().reverse();

  const today = dayKey(new Date());
  let cursor = today;

  // Grace period: if no log today, start from yesterday.
  if (!days.has(cursor)) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    cursor = y.toISOString().slice(0, 10);
    if (!days.has(cursor)) return { currentStreak: 0, longestStreak: longestRun(sorted) };
  }

  // Walk backwards day-by-day while each day has a log.
  let current = 0;
  while (days.has(cursor)) {
    current++;
    const d = new Date(cursor + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }

  return { currentStreak: current, longestStreak: Math.max(current, longestRun(sorted)) };
}

// Longest run of consecutive days anywhere in the user's history.
function longestRun(sortedDatesDesc) {
  if (!sortedDatesDesc.length) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const prev = new Date(sortedDatesDesc[i - 1] + 'T00:00:00Z');
    const curr = new Date(sortedDatesDesc[i] + 'T00:00:00Z');
    const diffDays = (prev - curr) / 86400000;
    if (diffDays === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

// Computes everything the badge `check` functions need.
export function computeStats(logs, weeklyScoreThisWeek, weeklyScorePrevWeek) {
  const { currentStreak, longestStreak } = computeStreak(logs);

  // Best score the user has ever achieved on a single day.
  const dayTotals = {};
  for (const l of logs) {
    dayTotals[dayKey(l.dateISO)] = (dayTotals[dayKey(l.dateISO)] || 0) + (l.co2Kg || 0);
  }
  let bestDailyScore = 0;
  for (const kg of Object.values(dayTotals)) {
    bestDailyScore = Math.max(bestDailyScore, Math.max(0, Math.round(100 - kg * 5)));
  }

  // Did the user log all 4 categories in a single day at any point?
  const dayCats = {};
  for (const l of logs) {
    const day = dayKey(l.dateISO);
    if (!dayCats[day]) dayCats[day] = new Set();
    dayCats[day].add(l.category || 'transport');
  }
  const hasLoggedAll4InOneDay = Object.values(dayCats).some((s) => s.size >= 4);

  return {
    totalLogs: logs.length,
    currentStreak,
    longestStreak,
    bestDailyScore,
    hasLoggedAll4InOneDay,
    weeklyImproved: weeklyScorePrevWeek > 0 && weeklyScoreThisWeek > weeklyScorePrevWeek,
  };
}

export function getEarnedBadges(stats) {
  return BADGES.filter((b) => b.check(stats));
}

export function getNextBadge(stats) {
  return BADGES.find((b) => !b.check(stats)) || null;
}
