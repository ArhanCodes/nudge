import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { textColor, muted, brand } from './theme';

export function Screen({ children, style }) {
  return <View style={[styles.screenBase, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return (
    <View style={[styles.cardBase, style]} accessibilityRole="summary">
      {children}
    </View>
  );
}

export function Title({ children, style }) {
  return (
    <Text style={[styles.titleBase, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Muted({ children, style }) {
  return <Text style={[styles.mutedBase, style]}>{children}</Text>;
}

export function Button({ label, onPress, kind, disabled, accessibilityLabel }) {
  const isPrimary = kind !== 'ghost';
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        isPrimary ? styles.btnPrimary : styles.btnGhost,
        pressed && !disabled ? { opacity: 0.86 } : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Text style={isPrimary ? styles.btnPrimaryText : styles.btnGhostText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, kind }) {
  const isBrand = kind === 'brand';
  return (
    <View
      style={[styles.chipBase, isBrand && styles.chipBrand]}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, isBrand && styles.chipTextBrand]}>
        {label}
      </Text>
    </View>
  );
}

export function ProgressRing({ progress, size, strokeWidth, color, bgColor, children }) {
  const sz = size || 120;
  const sw = strokeWidth || 10;
  const clr = color || brand;
  const bgc = bgColor || 'rgba(255,255,255,0.08)';
  const p = Math.max(0, Math.min(1, progress || 0));
  const pct = Math.round(p * 100);
  const radius = (sz - sw) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - p);

  return (
    <View
      style={{ width: sz, height: sz, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={`Progress: ${pct}%`}
      accessibilityRole="progressbar"
    >
      <Svg width={sz} height={sz} style={{ position: 'absolute' }}>
        {/* Background ring */}
        <Circle
          cx={sz / 2}
          cy={sz / 2}
          r={radius}
          stroke={bgc}
          strokeWidth={sw}
          fill="none"
        />
        {/* Progress arc — rotated -90deg so it starts at 12 o'clock */}
        <Circle
          cx={sz / 2}
          cy={sz / 2}
          r={radius}
          stroke={clr}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${sz / 2} ${sz / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBase: {
    flex: 1,
    backgroundColor: '#0b1020',
    padding: 16,
  },
  cardBase: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  titleBase: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 22,
    fontWeight: '900',
  },
  mutedBase: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    lineHeight: 18,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    borderColor: 'rgba(45,212,191,0.55)',
    backgroundColor: '#2dd4bf',
  },
  btnPrimaryText: {
    color: '#081019',
    fontWeight: '900',
  },
  btnGhost: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '900',
  },
  chipBase: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  chipBrand: {
    borderColor: 'rgba(45,212,191,0.55)',
    backgroundColor: 'rgba(45,212,191,0.15)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '900',
    fontSize: 12,
  },
  chipTextBrand: {
    color: 'rgba(255,255,255,0.92)',
  },
});
