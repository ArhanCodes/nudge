// badges, streaks, and stats. each badge has a check() that runs on stats

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
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// counts consecutive days logged, walking back from today.
// 1-day grace: if no log today, start from yesterday
export function computeStreak(logs) {
  if (!logs.length) return { currentStreak: 0, longestStreak: 0 };

  const days = new Set(logs.map((l) => dayKey(l.dateISO)));
  const sorted = [...days].sort().reverse();

  let cursor = dayKey(new Date());
  if (!days.has(cursor)) cursor = yesterday();
  if (!days.has(cursor)) return { currentStreak: 0, longestStreak: longestRun(sorted) };

  let current = 0;
  while (days.has(cursor)) {
    current++;
    const d = new Date(cursor + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  return { currentStreak: current, longestStreak: Math.max(current, longestRun(sorted)) };
}

// longest run of consecutive days in history
function longestRun(sortedDesc) {
  if (!sortedDesc.length) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const diffDays = (new Date(sortedDesc[i - 1]) - new Date(sortedDesc[i])) / 86400000;
    if (diffDays === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

// everything the badge check() functions need
export function computeStats(logs, weeklyScoreThisWeek, weeklyScorePrevWeek) {
  const { currentStreak, longestStreak } = computeStreak(logs);

  // best daily score ever
  const dayTotals = {};
  for (const l of logs) {
    dayTotals[dayKey(l.dateISO)] = (dayTotals[dayKey(l.dateISO)] || 0) + (l.co2Kg || 0);
  }
  const bestDailyScore = Object.values(dayTotals).reduce(
    (best, kg) => Math.max(best, Math.max(0, Math.round(100 - kg * 5))),
    0,
  );

  // any day where user logged all 4 categories
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
