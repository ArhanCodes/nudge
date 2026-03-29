import { getPersonalisedTips, getWorstCategory } from '../src/lib/tips';

describe('getWorstCategory', () => {
  it('returns category with highest CO₂', () => {
    expect(getWorstCategory({ transport: 5, diet: 10, energy: 3, waste: 1 })).toBe('diet');
  });

  it('defaults to transport if all zero', () => {
    expect(getWorstCategory({ transport: 0, diet: 0, energy: 0, waste: 0 })).toBe('transport');
  });
});

describe('getPersonalisedTips', () => {
  it('returns requested number of tips', () => {
    const tips = getPersonalisedTips({ transport: 5, diet: 10, energy: 3, waste: 1 }, 3);
    expect(tips).toHaveLength(3);
  });

  it('prioritises worst category', () => {
    const tips = getPersonalisedTips({ transport: 1, diet: 100, energy: 1, waste: 1 }, 1);
    expect(tips[0].category).toBe('diet');
  });

  it('returns tips from different categories', () => {
    const tips = getPersonalisedTips({ transport: 5, diet: 5, energy: 5, waste: 5 }, 4);
    const categories = new Set(tips.map((t) => t.category));
    expect(categories.size).toBe(4);
  });

  it('handles empty totals', () => {
    const tips = getPersonalisedTips({ transport: 0, diet: 0, energy: 0, waste: 0 }, 3);
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it('each tip has category and tip text', () => {
    const tips = getPersonalisedTips({ transport: 5, diet: 10, energy: 3, waste: 1 }, 5);
    for (const t of tips) {
      expect(t.category).toBeDefined();
      expect(typeof t.tip).toBe('string');
      expect(t.tip.length).toBeGreaterThan(0);
    }
  });

  it('does not return duplicate tips', () => {
    const tips = getPersonalisedTips({ transport: 5, diet: 10, energy: 3, waste: 1 }, 5);
    const tipTexts = tips.map((t) => t.tip);
    expect(new Set(tipTexts).size).toBe(tipTexts.length);
  });
});
