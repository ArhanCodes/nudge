// Streak tracking and badge/achievement system.

export const BADGES = [
  {
    id: 'first_log',
    name: 'First Step',
    desc: 'Log your first activity',
    icon: '🌱',
    check: (stats) => stats.totalLogs >= 1,
  },
  {
    id: 'week_streak_3',
    name: 'Consistent',
    desc: '3-day logging streak',
    icon: '🔥',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'week_streak_7',
    name: 'Full Week',
    desc: '7-day logging streak',
    icon: '⭐',
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'week_streak_14',
    name: 'Fortnight Hero',
    desc: '14-day logging streak',
    icon: '🏅',
    check: (stats) => stats.currentStreak >= 14,
  },
  {
    id: 'week_streak_30',
    name: 'Monthly Master',
    desc: '30-day logging streak',
    icon: '🏆',
    check: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'low_carbon_day',
    name: 'Green Day',
    desc: 'Score 80+ on any day',
    icon: '💚',
    check: (stats) => stats.bestDailyScore >= 80,
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    desc: 'Score 100 on a day',
    icon: '🌟',
    check: (stats) => stats.bestDailyScore >= 100,
  },
  {
    id: 'all_categories',
    name: 'Well-Rounded',
    desc: 'Log in all 4 categories in one day',
    icon: '🎯',
    check: (stats) => stats.hasLoggedAll4InOneDay,
  },
  {
    id: 'fifty_logs',
    name: 'Dedicated',
    desc: 'Log 50 activities total',
    icon: '📊',
    check: (stats) => stats.totalLogs >= 50,
  },
  {
    id: 'improvement',
    name: 'Improver',
    desc: 'Weekly score improved over last week',
    icon: '📈',
    check: (stats) => stats.weeklyImproved,
  },
];

export function computeStreak(logs) {
  if (!logs.length) return { currentStreak: 0, longestStreak: 0 };

  // Get unique log dates (YYYY-MM-DD)
  const dates = new Set(
    logs.map((l) => new Date(l.dateISO).toISOString().slice(0, 10))
  );
  const sorted = [...dates].sort().reverse(); // newest first

  // Check streak from today backwards
  const today = new Date().toISOString().slice(0, 10);
  let current = 0;
  let checkDate = today;

  // Allow streak if user logged today OR yesterday (grace period)
  if (!dates.has(checkDate)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    checkDate = yesterday.toISOString().slice(0, 10);
    if (!dates.has(checkDate)) {
      return { currentStreak: 0, longestStreak: computeLongest(sorted) };
    }
  }

  while (dates.has(checkDate)) {
    current++;
    const d = new Date(checkDate + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    checkDate = d.toISOString().slice(0, 10);
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(current, computeLongest(sorted)),
  };
}

function computeLongest(sortedDatesDesc) {
  if (!sortedDatesDesc.length) return 0;
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const prev = new Date(sortedDatesDesc[i - 1] + 'T00:00:00Z');
    const curr = new Date(sortedDatesDesc[i] + 'T00:00:00Z');
    const diff = (prev - curr) / 86400000;
    if (diff === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

export function computeStats(logs, weeklyScoreThisWeek, weeklyScorePrevWeek) {
  const { currentStreak, longestStreak } = computeStreak(logs);

  // Best daily score
  const dayTotals = {};
  for (const l of logs) {
    const day = new Date(l.dateISO).toISOString().slice(0, 10);
    dayTotals[day] = (dayTotals[day] || 0) + (l.co2Kg || 0);
  }
  let bestDailyScore = 0;
  for (const kg of Object.values(dayTotals)) {
    const score = Math.max(0, Math.round(100 - kg * 5));
    bestDailyScore = Math.max(bestDailyScore, score);
  }

  // Check if any day has all 4 categories
  const dayCats = {};
  for (const l of logs) {
    const day = new Date(l.dateISO).toISOString().slice(0, 10);
    if (!dayCats[day]) dayCats[day] = new Set();
    dayCats[day].add(l.category || 'transport');
  }
  const hasLoggedAll4InOneDay = Object.values(dayCats).some(
    (s) => s.size >= 4
  );

  return {
    totalLogs: logs.length,
    currentStreak,
    longestStreak,
    bestDailyScore,
    hasLoggedAll4InOneDay,
    weeklyImproved:
      weeklyScorePrevWeek > 0 && weeklyScoreThisWeek > weeklyScorePrevWeek,
  };
}

export function getEarnedBadges(stats) {
  return BADGES.filter((b) => b.check(stats));
}

export function getNextBadge(stats) {
  return BADGES.find((b) => !b.check(stats)) || null;
}
