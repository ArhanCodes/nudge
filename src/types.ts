// Core application types for Nudge carbon tracker.

export type Category = 'transport' | 'diet' | 'energy' | 'waste';

export type RegionKey =
  | 'world' | 'uk' | 'uae' | 'us' | 'eu'
  | 'india' | 'china' | 'aus' | 'canada'
  | 'brazil' | 'france' | 'nordic';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface School extends Coordinates {
  name: string;
}

export interface Home extends Coordinates {
  label: string;
}

export interface ActivityLog {
  id: string;
  dateISO: string;
  category: Category;
  itemKey: string;
  label: string;
  co2Kg: number;
  quantity: number;
  notes?: string;
  // Transport-specific fields
  oneWayKm?: number;
  transport?: string;
  transportLabel?: string;
}

export interface AppState {
  school: School | null;
  home: Home | null;
  targetKgPerWeek: number;
  region: RegionKey;
  onboarded: boolean;
  logs: ActivityLog[];
}

export interface BadgeStats {
  totalLogs: number;
  currentStreak: number;
  longestStreak: number;
  bestDailyScore: number;
  hasLoggedAll4InOneDay: boolean;
  weeklyImproved: boolean;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  check: (stats: BadgeStats) => boolean;
}

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
}

export interface CategoryItem {
  label: string;
  co2: number;
  icon: string;
}

export interface PersonalisedTip {
  category: Category;
  tip: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
}
