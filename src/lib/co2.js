// Simple approximate CO2 factors (kg CO2 per km per person)
// These are rough averages for educational use.
export const CO2_FACTORS = {
  car: 0.171,
  bus: 0.089,
  metro: 0.041,
  taxi: 0.2,
  motorbike: 0.103,
  cycle: 0,
  walk: 0,
};

export const TRANSPORT_LABELS = {
  car: 'Car',
  bus: 'Bus',
  metro: 'Metro/Train',
  taxi: 'Taxi',
  motorbike: 'Motorbike',
  cycle: 'Cycle',
  walk: 'Walk',
};

export function computeCo2Kg({ transport, oneWayKm }) {
  const factor = CO2_FACTORS[transport] ?? 0;
  // round trip = 2x
  return factor * oneWayKm * 2;
}
