// Region-specific electricity grid carbon intensity multipliers.
// The base ENERGY_ITEMS in co2.js assume a "world average" grid (~0.5 kg CO₂/kWh).
// These multipliers adjust energy emissions for the user's region.
// Sources: IEA 2023, Ember Climate, Carbon Intensity API.

export const REGIONS = {
  world:  { label: 'World Average',       multiplier: 1.0 },
  uk:     { label: 'United Kingdom',       multiplier: 0.45 },  // ~0.23 kg/kWh, cleaner grid
  uae:    { label: 'UAE',                  multiplier: 1.1 },   // gas-heavy grid
  us:     { label: 'United States',        multiplier: 0.85 },  // mixed grid
  eu:     { label: 'EU Average',           multiplier: 0.6 },   // lots of renewables + nuclear
  india:  { label: 'India',               multiplier: 1.5 },   // coal-heavy grid
  china:  { label: 'China',               multiplier: 1.35 },  // coal-heavy grid
  aus:    { label: 'Australia',            multiplier: 1.3 },   // coal + gas
  canada: { label: 'Canada',              multiplier: 0.35 },  // hydro-heavy
  brazil: { label: 'Brazil',              multiplier: 0.25 },  // very hydro-heavy
  france: { label: 'France',              multiplier: 0.2 },   // nuclear-heavy
  nordic: { label: 'Nordics (Swe/Nor/Fin)', multiplier: 0.15 }, // hydro + wind + nuclear
};

export function getRegionMultiplier(regionKey) {
  return REGIONS[regionKey]?.multiplier ?? 1.0;
}
