// Date helpers used to group activities by week and day.

// ISO 8601 week key, e.g. "2026-W19". Two dates in the same ISO week share the
// same key. Used to filter logs into weekly buckets.
export function weekKeyISO(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  // Shift to the Thursday in the same week (the ISO standard's reference day).
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// First day (Monday) of the week containing `date`, as an ISO yyyy-mm-dd string.
export function startOfWeekISO(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// Add `n` days to an ISO yyyy-mm-dd string and return another ISO date.
export function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
