import {
  CO2_FACTORS,
  computeCo2Kg,
  computeDailyScore,
  computeWeeklyScore,
  getCategoryItems,
  getRegionAdjustedEnergy,
  compareToBenchmark,
  WEEKLY_BENCHMARKS,
  DIET_ITEMS,
  ENERGY_ITEMS,
  WASTE_ITEMS } from
'../src/lib/co2';

describe('CO2_FACTORS', () => {
  it('has zero emissions for walking and cycling', () => {
    expect(CO2_FACTORS.walk).toBe(0);
    expect(CO2_FACTORS.cycle).toBe(0);
  });

  it('car emits more than bus', () => {
    expect(CO2_FACTORS.car).toBeGreaterThan(CO2_FACTORS.bus);
  });

  it('all factors are non-negative', () => {
    for (const [, factor] of Object.entries(CO2_FACTORS)) {
      expect(factor).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('computeCo2Kg', () => {
  it('computes round-trip CO₂ for car', () => {
    const result = computeCo2Kg({ transport: 'car', oneWayKm: 10 });

    expect(result).toBeCloseTo(3.42, 2);
  });

  it('returns 0 for walking', () => {
    expect(computeCo2Kg({ transport: 'walk', oneWayKm: 5 })).toBe(0);
  });

  it('returns 0 for unknown transport', () => {
    expect(computeCo2Kg({ transport: 'teleport', oneWayKm: 100 })).toBe(0);
  });

  it('handles zero distance', () => {
    expect(computeCo2Kg({ transport: 'car', oneWayKm: 0 })).toBe(0);
  });
});

describe('computeDailyScore', () => {
  it('returns 100 for 0 kg day', () => {
    expect(computeDailyScore(0)).toBe(100);
  });

  it('returns 0 for >= 20 kg day', () => {
    expect(computeDailyScore(20)).toBe(0);
    expect(computeDailyScore(25)).toBe(0);
  });

  it('deducts 5 points per kg', () => {
    expect(computeDailyScore(10)).toBe(50);
  });

  it('never goes negative', () => {
    expect(computeDailyScore(999)).toBe(0);
  });
});

describe('computeWeeklyScore', () => {
  it('returns 0 for empty array', () => {
    expect(computeWeeklyScore([])).toBe(0);
  });

  it('averages daily scores', () => {

    expect(computeWeeklyScore([0, 10])).toBe(75);
  });

  it('handles single day', () => {
    expect(computeWeeklyScore([4])).toBe(80);
  });
});

describe('getCategoryItems', () => {
  it('returns diet items for diet', () => {
    expect(getCategoryItems('diet')).toBe(DIET_ITEMS);
  });

  it('returns waste items for waste', () => {
    expect(getCategoryItems('waste')).toBe(WASTE_ITEMS);
  });

  it('returns empty for transport (handled separately)', () => {
    expect(getCategoryItems('transport')).toEqual({});
  });

  it('returns region-adjusted energy items', () => {
    const items = getCategoryItems('energy', 'france');

    expect(items.ac_1hr.co2).toBeLessThan(ENERGY_ITEMS.ac_1hr.co2);
  });
});

describe('getRegionAdjustedEnergy', () => {
  it('returns original items for world average', () => {
    const items = getRegionAdjustedEnergy('world');
    expect(items).toBe(ENERGY_ITEMS);
  });

  it('scales values for UK region', () => {
    const items = getRegionAdjustedEnergy('uk');

    expect(items.ac_1hr.co2).toBeCloseTo(1.5 * 0.45, 2);
  });

  it('handles unknown region as world average', () => {
    const items = getRegionAdjustedEnergy('mars');
    expect(items).toBe(ENERGY_ITEMS);
  });
});

describe('WEEKLY_BENCHMARKS', () => {
  it('has benchmark data for all major regions', () => {
    const expectedRegions = ['world', 'uk', 'uae', 'us', 'eu', 'india', 'china', 'aus', 'canada', 'brazil', 'france', 'nordic'];
    for (const key of expectedRegions) {
      expect(WEEKLY_BENCHMARKS[key]).toBeDefined();
      expect(WEEKLY_BENCHMARKS[key].kgPerWeek).toBeGreaterThan(0);
      expect(WEEKLY_BENCHMARKS[key].source).toBeTruthy();
    }
  });

  it('has reasonable benchmark values', () => {

    expect(WEEKLY_BENCHMARKS.india.kgPerWeek).toBeLessThan(WEEKLY_BENCHMARKS.uae.kgPerWeek);

    expect(WEEKLY_BENCHMARKS.france.kgPerWeek).toBeLessThan(WEEKLY_BENCHMARKS.us.kgPerWeek);
  });
});

describe('compareToBenchmark', () => {
  it('shows savings when user is below national average', () => {
    const result = compareToBenchmark(10, 'uk');
    expect(result.better).toBe(true);
    expect(result.savedKg).toBeCloseTo(68, 0);
    expect(result.savedPct).toBeGreaterThan(80);
    expect(result.benchmarkLabel).toBe('UK Average');
  });

  it('shows excess when user is above national average', () => {
    const result = compareToBenchmark(200, 'uk');
    expect(result.better).toBe(false);
    expect(result.savedKg).toBeLessThan(0);
  });

  it('falls back to world average for unknown region', () => {
    const result = compareToBenchmark(50, 'mars');
    expect(result.benchmarkKg).toBe(WEEKLY_BENCHMARKS.world.kgPerWeek);
  });

  it('handles zero user emissions', () => {
    const result = compareToBenchmark(0, 'world');
    expect(result.better).toBe(true);
    expect(result.savedPct).toBeCloseTo(100, 0);
  });

  it('returns source citation', () => {
    const result = compareToBenchmark(10, 'uk');
    expect(result.benchmarkSource).toContain('BEIS');
  });
});