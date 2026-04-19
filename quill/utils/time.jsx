
import React from 'react';
import { StyleSheet } from 'react-native';

export function weekKeyISO(date) {
  let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let dayNum = d.getUTCDay();
  if (dayNum === 0) {
    dayNum = 7;
  }
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}
export function startOfWeekISO(date) {
  let d = new Date(date);
  let day = d.getDay();
  let diff = 0;
  if (day === 0) {
    diff = -6 - day;
  } else {
    diff = 1 - day;
  }
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
export function addDaysISO(iso, n) {
  let d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}