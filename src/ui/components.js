import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Muted({ children, style }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Button({ label, onPress, kind = 'primary', disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        kind === 'primary' ? styles.btnPrimary : styles.btnGhost,
        pressed && !disabled ? { opacity: 0.86 } : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Text style={kind === 'primary' ? styles.btnPrimaryText : styles.btnGhostText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, kind = 'default' }) {
  return (
    <View style={[styles.chip, kind === 'brand' && styles.chipBrand]}>
      <Text style={[styles.chipText, kind === 'brand' && styles.chipTextBrand]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  muted: {
    color: colors.muted,
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
    backgroundColor: colors.brand,
  },
  btnPrimaryText: {
    color: '#081019',
    fontWeight: '900',
  },
  btnGhost: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '900',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.muted,
    fontWeight: '900',
    fontSize: 12,
  },
  chipTextBrand: {
    color: colors.text,
  },
});
