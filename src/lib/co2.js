// ── CO₂e emission factors across 4 domains ──
// All values in kg CO₂e per unit (event/km/kWh/item).
// Sources: DEFRA 2023, EPA, Our World in Data, peer-reviewed LCA studies.

// ─── TRANSPORT (kg CO₂e per km, one-way) ───
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
  return factor * oneWayKm * 2;
}

// ─── DIET (kg CO₂e per meal / serving) ───
export const DIET_ITEMS = {
  beef_meal:       { label: 'Beef meal',           co2: 6.0,  icon: '🥩' },
  lamb_meal:       { label: 'Lamb meal',           co2: 5.0,  icon: '🍖' },
  chicken_meal:    { label: 'Chicken meal',        co2: 1.8,  icon: '🍗' },
  fish_meal:       { label: 'Fish meal',           co2: 1.5,  icon: '🐟' },
  dairy_heavy:     { label: 'Dairy-heavy meal',    co2: 2.5,  icon: '🧀' },
  vegetarian_meal: { label: 'Vegetarian meal',     co2: 0.7,  icon: '🥗' },
  vegan_meal:      { label: 'Vegan meal',          co2: 0.4,  icon: '🌱' },
  coffee:          { label: 'Coffee (1 cup)',      co2: 0.21, icon: '☕' },
  bottled_water:   { label: 'Bottled water (500ml)', co2: 0.16, icon: '🍼' },
};

// ─── ENERGY (kg CO₂e per event) ───
export const ENERGY_ITEMS = {
  ac_1hr:            { label: 'Air conditioning (1 hr)',  co2: 1.5,  icon: '❄️' },
  heating_1hr:       { label: 'Heating (1 hr)',           co2: 1.2,  icon: '🔥' },
  washing_machine:   { label: 'Washing machine load',     co2: 0.6,  icon: '👕' },
  dryer_load:        { label: 'Dryer load',               co2: 2.4,  icon: '🌀' },
  dishwasher:        { label: 'Dishwasher cycle',         co2: 0.7,  icon: '🍽️' },
  hot_shower_5min:   { label: 'Hot shower (5 min)',       co2: 0.5,  icon: '🚿' },
  gaming_1hr:        { label: 'Gaming console (1 hr)',    co2: 0.15, icon: '🎮' },
  streaming_1hr:     { label: 'Streaming video (1 hr)',   co2: 0.036,icon: '📺' },
  lights_on_1hr:     { label: 'Lights on (1 hr, LED)',    co2: 0.005,icon: '💡' },
  cooking_gas_30min: { label: 'Gas cooking (30 min)',     co2: 0.9,  icon: '🍳' },
};

// ─── WASTE (kg CO₂e per item/event) ───
export const WASTE_ITEMS = {
  plastic_bag:      { label: 'Plastic bag used',         co2: 0.033, icon: '🛍️' },
  plastic_bottle:   { label: 'Plastic bottle (landfill)', co2: 0.082, icon: '🧴' },
  food_waste_500g:  { label: 'Food waste (500g)',         co2: 1.1,   icon: '🗑️' },
  recycled_paper:   { label: 'Paper recycled (neg.)',     co2: -0.05, icon: '♻️' },
  recycled_plastic: { label: 'Plastic recycled (neg.)',   co2: -0.04, icon: '♻️' },
  composted_500g:   { label: 'Composted food (500g)',     co2: 0.1,   icon: '🌿' },
  fast_fashion_item:{ label: 'Fast fashion item',         co2: 10.0,  icon: '👗' },
  e_waste_small:    { label: 'E-waste (small device)',    co2: 5.0,   icon: '📱' },
};

// ─── Unified category map ───
export const CATEGORIES = {
  transport: { label: 'Transport', color: '#3b82f6', icon: '🚗' },
  diet:      { label: 'Diet',      color: '#f59e0b', icon: '🍽️' },
  energy:    { label: 'Energy',    color: '#ef4444', icon: '⚡' },
  waste:     { label: 'Waste',     color: '#8b5cf6', icon: '🗑️' },
};

export function getCategoryItems(category) {
  switch (category) {
    case 'diet':   return DIET_ITEMS;
    case 'energy': return ENERGY_ITEMS;
    case 'waste':  return WASTE_ITEMS;
    default:       return {};
  }
}

// ── Scoring ──
// Sustainability score: 100 = perfect day, deducts points per kg CO₂e
// Average person: ~22 kg CO₂e/day. A "good" day might be ~5 kg.
// Score = max(0, 100 - totalDayKg * 5)
export function computeDailyScore(totalDayKgCo2) {
  return Math.max(0, Math.round(100 - totalDayKgCo2 * 5));
}

// Weekly score = average of daily scores
export function computeWeeklyScore(dailyTotals) {
  if (!dailyTotals.length) return 0;
  const sum = dailyTotals.reduce((a, kg) => a + computeDailyScore(kg), 0);
  return Math.round(sum / dailyTotals.length);
}
