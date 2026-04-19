
import React from 'react';
import { StyleSheet } from 'react-native';

export let REGIONS = { world: { label: "World Average", multiplier: 1 }, uk: { label: "United Kingdom", multiplier: 0.45 }, uae: { label: "UAE", multiplier: 1.1 }, us: { label: "United States", multiplier: 0.85 }, eu: { label: "EU Average", multiplier: 0.6 }, india: { label: "India", multiplier: 1.5 }, china: { label: "China", multiplier: 1.35 }, aus: { label: "Australia", multiplier: 1.3 }, canada: { label: "Canada", multiplier: 0.35 }, brazil: { label: "Brazil", multiplier: 0.25 }, france: { label: "France", multiplier: 0.2 }, nordic: { label: "Nordics (Swe/Nor/Fin)", multiplier: 0.15 } };
export function getRegionMultiplier(regionKey) {
  if (REGIONS[regionKey]) {
    return REGIONS[regionKey].multiplier;
  }
  return 1;
}