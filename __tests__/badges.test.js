import { computeStreak, computeStats, getEarnedBadges, getNextBadge, BADGES } from '../src/lib/badges';

function makeLog(dateISO, category = 'transport') {
  return { id: String(Math.random()), dateISO, category, co2Kg: 1 };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('computeStreak', () => {
  it('returns 0 for empty logs', () => {
    const { currentStreak, longestStreak } = computeStreak([]);
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(0);
  });

  it('counts consecutive days from today', () => {
    const logs = [
    makeLog(daysAgo(0)),
    makeLog(daysAgo(1)),
    makeLog(daysAgo(2))];

    const { currentStreak } = computeStreak(logs);
    expect(currentStreak).toBe(3);
  });

  it('grace period: streak counts from yesterday if no log today', () => {
    const logs = [
    makeLog(daysAgo(1)),
    makeLog(daysAgo(2))];

    const { currentStreak } = computeStreak(logs);
    expect(currentStreak).toBe(2);
  });

  it('breaks streak if gap of 2+ days', () => {
    const logs = [
    makeLog(daysAgo(3)),
    makeLog(daysAgo(4))];

    const { currentStreak } = computeStreak(logs);
    expect(currentStreak).toBe(0);
  });

  it('longest streak tracks historical best', () => {
    const logs = [

    makeLog(daysAgo(10)),
    makeLog(daysAgo(11)),
    makeLog(daysAgo(12)),


    makeLog(daysAgo(0))];

    const { currentStreak, longestStreak } = computeStreak(logs);
    expect(currentStreak).toBe(1);
    expect(longestStreak).toBe(3);
  });

  it('handles duplicate dates correctly', () => {
    const logs = [
    makeLog(daysAgo(0)),
    makeLog(daysAgo(0)),
    makeLog(daysAgo(1))];

    const { currentStreak } = computeStreak(logs);
    expect(currentStreak).toBe(2);
  });
});

describe('computeStats', () => {
  it('counts total logs', () => {
    const logs = [makeLog(daysAgo(0)), makeLog(daysAgo(1))];
    const stats = computeStats(logs, 50, 40);
    expect(stats.totalLogs).toBe(2);
  });

  it('detects weekly improvement', () => {
    const stats = computeStats([], 60, 50);
    expect(stats.weeklyImproved).toBe(true);
  });

  it('no improvement when prev week is 0', () => {
    const stats = computeStats([], 60, 0);
    expect(stats.weeklyImproved).toBe(false);
  });

  it('detects all 4 categories in one day', () => {
    const today = daysAgo(0);
    const logs = [
    makeLog(today, 'transport'),
    makeLog(today, 'diet'),
    makeLog(today, 'energy'),
    makeLog(today, 'waste')];

    const stats = computeStats(logs, 50, 50);
    expect(stats.hasLoggedAll4InOneDay).toBe(true);
  });
});

describe('getEarnedBadges', () => {
  it('returns first_log badge with 1+ logs', () => {
    const stats = {
      totalLogs: 1,
      currentStreak: 0,
      longestStreak: 0,
      bestDailyScore: 0,
      hasLoggedAll4InOneDay: false,
      weeklyImproved: false
    };
    const earned = getEarnedBadges(stats);
    expect(earned.some((b) => b.id === 'first_log')).toBe(true);
  });

  it('returns empty for no logs', () => {
    const stats = {
      totalLogs: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestDailyScore: 0,
      hasLoggedAll4InOneDay: false,
      weeklyImproved: false
    };
    expect(getEarnedBadges(stats)).toHaveLength(0);
  });
});

describe('getNextBadge', () => {
  it('returns the first unearned badge', () => {
    const stats = {
      totalLogs: 0,
      currentStreak: 0,
      longestStreak: 0,
      bestDailyScore: 0,
      hasLoggedAll4InOneDay: false,
      weeklyImproved: false
    };
    const next = getNextBadge(stats);
    expect(next).not.toBeNull();
    expect(next.id).toBe('first_log');
  });

  it('returns null when all badges earned', () => {
    const stats = {
      totalLogs: 50,
      currentStreak: 30,
      longestStreak: 30,
      bestDailyScore: 100,
      hasLoggedAll4InOneDay: true,
      weeklyImproved: true
    };
    expect(getNextBadge(stats)).toBeNull();
  });
});

describe('BADGES', () => {
  it('has 10 badges', () => {
    expect(BADGES).toHaveLength(10);
  });

  it('all badges have required fields', () => {
    for (const b of BADGES) {
      expect(b.id).toBeDefined();
      expect(b.name).toBeDefined();
      expect(b.desc).toBeDefined();
      expect(b.icon).toBeDefined();
      expect(typeof b.check).toBe('function');
    }
  });
});