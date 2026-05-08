import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from './theme';

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]} accessibilityRole="summary">{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]} accessibilityRole="header">{children}</Text>;
}

export function Muted({ children, style }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Spacer({ h = 12 }) {
  return <View style={{ height: h }} />;
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input(props) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,0.45)"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Button({ label, onPress, kind = 'primary', disabled, accessibilityLabel }) {
  const isPrimary = kind === 'primary';
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
        pressed && !disabled && { opacity: 0.86 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={isPrimary ? styles.btnPrimaryText : styles.btnGhostText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, kind = 'default' }) {
  const isBrand = kind === 'brand';
  return (
    <View style={[styles.chip, isBrand && styles.chipBrand]} accessibilityLabel={label}>
      <Text style={[styles.chipText, isBrand && styles.chipTextBrand]}>{label}</Text>
    </View>
  );
}

export function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  color = colors.brand,
  bgColor = 'rgba(255,255,255,0.08)',
  children,
}) {
  const p = Math.max(0, Math.min(1, progress));
  const pct = Math.round(p * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const half = size / 2;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={`Progress: ${pct}%`}
      accessibilityRole="progressbar"
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={half} cy={half} r={radius} stroke={bgColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={half}
          cy={half}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - p)}
          transform={`rotate(-90 ${half} ${half})`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  label: { color: colors.muted, fontWeight: '900', marginBottom: 6, marginTop: 10 },
  input: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnPrimary: { borderColor: 'rgba(45,212,191,0.55)', backgroundColor: colors.brand },
  btnPrimaryText: { color: colors.brandText, fontWeight: '900' },
  btnGhost: { borderColor: colors.border, backgroundColor: 'transparent' },
  btnGhostText: { color: colors.text, fontWeight: '900' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  chipBrand: { borderColor: 'rgba(45,212,191,0.55)', backgroundColor: 'rgba(45,212,191,0.15)' },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextBrand: { color: colors.text },
});
