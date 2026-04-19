


import { getRegionMultiplier } from './regions';


export const CO2_FACTORS = {
  car: 0.171,
  bus: 0.089,
  metro: 0.041,
  taxi: 0.2,
  motorbike: 0.103,
  cycle: 0,
  walk: 0
};

export const TRANSPORT_LABELS = {
  car: 'Car',
  bus: 'Bus',
  metro: 'Metro/Train',
  taxi: 'Taxi',
  motorbike: 'Motorbike',
  cycle: 'Cycle',
  walk: 'Walk'
};

export function computeCo2Kg({ transport, oneWayKm }) {
  const factor = CO2_FACTORS[transport] ?? 0;
  return factor * oneWayKm * 2;
}


export const DIET_ITEMS = {
  beef_meal: { label: 'Beef meal', co2: 6.0, icon: '🥩' },
  lamb_meal: { label: 'Lamb meal', co2: 5.0, icon: '🍖' },
  chicken_meal: { label: 'Chicken meal', co2: 1.8, icon: '🍗' },
  fish_meal: { label: 'Fish meal', co2: 1.5, icon: '🐟' },
  dairy_heavy: { label: 'Dairy-heavy meal', co2: 2.5, icon: '🧀' },
  vegetarian_meal: { label: 'Vegetarian meal', co2: 0.7, icon: '🥗' },
  vegan_meal: { label: 'Vegan meal', co2: 0.4, icon: '🌱' },
  coffee: { label: 'Coffee (1 cup)', co2: 0.21, icon: '☕' },
  bottled_water: { label: 'Bottled water (500ml)', co2: 0.16, icon: '🍼' }
};


export const ENERGY_ITEMS = {
  ac_1hr: { label: 'Air conditioning (1 hr)', co2: 1.5, icon: '❄️' },
  heating_1hr: { label: 'Heating (1 hr)', co2: 1.2, icon: '🔥' },
  washing_machine: { label: 'Washing machine load', co2: 0.6, icon: '👕' },
  dryer_load: { label: 'Dryer load', co2: 2.4, icon: '🌀' },
  dishwasher: { label: 'Dishwasher cycle', co2: 0.7, icon: '🍽️' },
  hot_shower_5min: { label: 'Hot shower (5 min)', co2: 0.5, icon: '🚿' },
  gaming_1hr: { label: 'Gaming console (1 hr)', co2: 0.15, icon: '🎮' },
  streaming_1hr: { label: 'Streaming video (1 hr)', co2: 0.036, icon: '📺' },
  lights_on_1hr: { label: 'Lights on (1 hr, LED)', co2: 0.005, icon: '💡' },
  cooking_gas_30min: { label: 'Gas cooking (30 min)', co2: 0.9, icon: '🍳' }
};


export const WASTE_ITEMS = {
  plastic_bag: { label: 'Plastic bag used', co2: 0.033, icon: '🛍️' },
  plastic_bottle: { label: 'Plastic bottle (landfill)', co2: 0.082, icon: '🧴' },
  food_waste_500g: { label: 'Food waste (500g)', co2: 1.1, icon: '🗑️' },
  recycled_paper: { label: 'Paper recycled (neg.)', co2: -0.05, icon: '♻️' },
  recycled_plastic: { label: 'Plastic recycled (neg.)', co2: -0.04, icon: '♻️' },
  composted_500g: { label: 'Composted food (500g)', co2: 0.1, icon: '🌿' },
  fast_fashion_item: { label: 'Fast fashion item', co2: 10.0, icon: '👗' },
  e_waste_small: { label: 'E-waste (small device)', co2: 5.0, icon: '📱' }
};


export const CATEGORIES = {
  transport: { label: 'Transport', color: '#3b82f6', icon: '🚗' },
  diet: { label: 'Diet', color: '#f59e0b', icon: '🍽️' },
  energy: { label: 'Energy', color: '#ef4444', icon: '⚡' },
  waste: { label: 'Waste', color: '#8b5cf6', icon: '🗑️' }
};

export function getCategoryItems(category, region) {
  switch (category) {
    case 'diet':return DIET_ITEMS;
    case 'energy':return getRegionAdjustedEnergy(region);
    case 'waste':return WASTE_ITEMS;
    default:return {};
  }
}


export function getRegionAdjustedEnergy(region) {
  const multiplier = getRegionMultiplier(region);
  if (multiplier === 1.0) return ENERGY_ITEMS;

  const adjusted = {};
  for (const [key, item] of Object.entries(ENERGY_ITEMS)) {
    adjusted[key] = { ...item, co2: +(item.co2 * multiplier).toFixed(3) };
  }
  return adjusted;
}





export function computeDailyScore(totalDayKgCo2) {
  return Math.max(0, Math.round(100 - totalDayKgCo2 * 5));
}


export function computeWeeklyScore(dailyTotals) {
  if (!dailyTotals.length) return 0;
  const sum = dailyTotals.reduce((a, kg) => a + computeDailyScore(kg), 0);
  return Math.round(sum / dailyTotals.length);
}






export const WEEKLY_BENCHMARKS = {
  world: { label: 'World Average', kgPerWeek: 95, source: 'IEA / Our World in Data 2023' },
  uk: { label: 'UK Average', kgPerWeek: 78, source: 'BEIS / DEFRA 2023' },
  uae: { label: 'UAE Average', kgPerWeek: 135, source: 'IEA 2023' },
  us: { label: 'US Average', kgPerWeek: 115, source: 'EPA 2023' },
  eu: { label: 'EU Average', kgPerWeek: 72, source: 'EEA / Eurostat 2023' },
  india: { label: 'India Average', kgPerWeek: 28, source: 'IEA 2023' },
  china: { label: 'China Average', kgPerWeek: 82, source: 'IEA 2023' },
  aus: { label: 'Australia Average', kgPerWeek: 110, source: 'Dept. Climate Change 2023' },
  canada: { label: 'Canada Average', kgPerWeek: 105, source: 'ECCC 2023' },
  brazil: { label: 'Brazil Average', kgPerWeek: 35, source: 'SEEG / Our World in Data' },
  france: { label: 'France Average', kgPerWeek: 58, source: 'CITEPA / INSEE 2023' },
  nordic: { label: 'Nordics Average', kgPerWeek: 62, source: 'Nordic Energy Research 2023' }
};





export function compareToBenchmark(userWeeklyKg, regionKey = 'world') {
  const benchmark = WEEKLY_BENCHMARKS[regionKey] || WEEKLY_BENCHMARKS.world;
  const benchmarkKg = benchmark.kgPerWeek;
  const savedKg = benchmarkKg - userWeeklyKg;
  const savedPct = benchmarkKg > 0 ? savedKg / benchmarkKg * 100 : 0;
  return {
    benchmarkKg,
    benchmarkLabel: benchmark.label,
    benchmarkSource: benchmark.source,
    savedKg,
    savedPct,
    better: savedKg > 0
  };
}