import { haversineKm } from '../src/lib/geo';

describe('haversineKm', () => {
  it('returns 0 for same point', () => {
    const p = { latitude: 51.5074, longitude: -0.1278 };
    expect(haversineKm(p, p)).toBeCloseTo(0, 5);
  });

  it('computes London to Paris correctly (~340 km)', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const d = haversineKm(london, paris);
    expect(d).toBeGreaterThan(330);
    expect(d).toBeLessThan(350);
  });

  it('is symmetric', () => {
    const a = { latitude: 25.2048, longitude: 55.2708 };
    const b = { latitude: 51.5074, longitude: -0.1278 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 5);
  });

  it('handles antipodal points (~20000 km)', () => {
    const north = { latitude: 0, longitude: 0 };
    const south = { latitude: 0, longitude: 180 };
    const d = haversineKm(north, south);
    expect(d).toBeGreaterThan(19000);
    expect(d).toBeLessThan(21000);
  });
});