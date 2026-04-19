import { weekKeyISO, startOfWeekISO, addDaysISO } from '../src/utils/time';

describe('weekKeyISO', () => {
  it('returns YYYY-Www format', () => {
    const key = weekKeyISO(new Date('2024-01-15'));
    expect(key).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('same week for Mon and Sun', () => {

    const mon = weekKeyISO(new Date('2024-01-15'));
    const sun = weekKeyISO(new Date('2024-01-21'));
    expect(mon).toBe(sun);
  });

  it('different week for Sun and next Mon', () => {
    const sun = weekKeyISO(new Date('2024-01-21'));
    const nextMon = weekKeyISO(new Date('2024-01-22'));
    expect(sun).not.toBe(nextMon);
  });
});

describe('startOfWeekISO', () => {
  it('returns Monday for a Wednesday', () => {

    expect(startOfWeekISO(new Date('2024-01-17'))).toBe('2024-01-15');
  });

  it('returns same day if already Monday', () => {
    expect(startOfWeekISO(new Date('2024-01-15'))).toBe('2024-01-15');
  });

  it('returns previous Monday for Sunday', () => {

    expect(startOfWeekISO(new Date('2024-01-21'))).toBe('2024-01-15');
  });
});

describe('addDaysISO', () => {
  it('adds positive days', () => {
    expect(addDaysISO('2024-01-15', 3)).toBe('2024-01-18');
  });

  it('subtracts with negative days', () => {
    expect(addDaysISO('2024-01-15', -1)).toBe('2024-01-14');
  });

  it('handles month boundary', () => {
    expect(addDaysISO('2024-01-31', 1)).toBe('2024-02-01');
  });

  it('handles year boundary', () => {
    expect(addDaysISO('2024-12-31', 1)).toBe('2025-01-01');
  });
});