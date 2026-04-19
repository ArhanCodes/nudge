import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

export function Button({ label, onPress, kind = 'primary', disabled, accessibilityLabel }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
      styles.btn,
      kind === 'primary' ? styles.btnPrimary : styles.btnGhost,
      pressed && !disabled ? { opacity: 0.86 } : null,
      disabled ? { opacity: 0.5 } : null]
      }>
      
      <Text style={kind === 'primary' ? styles.btnPrimaryText : styles.btnGhostText}>{label}</Text>
    </Pressable>);

}

export function Chip({ label, kind = 'default' }) {
  return (
    <View style={[styles.chip, kind === 'brand' && styles.chipBrand]} accessibilityLabel={label}>
      <Text style={[styles.chipText, kind === 'brand' && styles.chipTextBrand]}>{label}</Text>
    </View>);

}





export function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  color = colors.brand,
  bgColor = 'rgba(255,255,255,0.08)',
  children
}) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clampedProgress * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);



  const isOver50 = pct > 50;
  const rotation = clampedProgress * 360;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={`Progress: ${pct}%`}
      accessibilityRole="progressbar">
      
      {}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor
        }} />
      

      {}
      <View style={{ position: 'absolute', width: size, height: size, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute',
          width: size / 2,
          height: size,
          right: 0,
          overflow: 'hidden'
        }}>
          <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: `${Math.min(rotation, 180)}deg` }]
          }} />
        </View>
      </View>

      {}
      {isOver50 &&
      <View style={{ position: 'absolute', width: size, height: size, overflow: 'hidden' }}>
          <View style={{
          position: 'absolute',
          width: size / 2,
          height: size,
          left: 0,
          overflow: 'hidden'
        }}>
            <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderRightColor: 'transparent',
            borderTopColor: 'transparent',
            transform: [{ rotate: `${rotation - 180}deg` }]
          }} />
          </View>
        </View>
      }

      {}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>);

}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900'
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  btnPrimary: {
    borderColor: 'rgba(45,212,191,0.55)',
    backgroundColor: colors.brand
  },
  btnPrimaryText: {
    color: '#081019',
    fontWeight: '900'
  },
  btnGhost: {
    borderColor: colors.border,
    backgroundColor: 'transparent'
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '900'
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  chipBrand: {
    borderColor: 'rgba(45,212,191,0.55)',
    backgroundColor: 'rgba(45,212,191,0.15)'
  },
  chipText: {
    color: colors.muted,
    fontWeight: '900',
    fontSize: 12
  },
  chipTextBrand: {
    color: colors.text
  }
});