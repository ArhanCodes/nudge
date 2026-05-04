import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Svg from 'react-native-svg';

import { bg, card, border, textColor, muted, brand } from './theme';

export function Screen({ children, style }) {
  return (
    <View style={[styles.screenBase, style]}>
      {children}
    </View>);

}

export function Card({ children, style }) {
  return (
    <View style={[styles.cardBase, style]} accessibilityRole={"summary"}>
      {children}
    </View>);

}

export function Title({ children, style }) {
  return (
    <Text style={[styles.titleBase, style]} accessibilityRole={"header"}>
      {children}
    </Text>);

}

export function Muted({ children, style }) {
  return (
    <Text style={[styles.mutedBase, style]}>
      {children}
    </Text>);

}

export function Button({ label, onPress, kind, disabled, accessibilityLabel }) {
  const accessLabel = () => {
    return accessibilityLabel || label;
  };


  let al = accessLabel();

  return (
    <>
      {kind === "ghost" ?
      <Pressable onPress={onPress} style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]} accessibilityRole={"button"} accessibilityLabel={al} disabled={disabled}>
          <Text style={styles.btnGhostText}>{label}</Text>
        </Pressable> :

      <Pressable style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]} accessibilityRole={"button"} accessibilityLabel={al} disabled={disabled} onPress={onPress}>
          <Text style={styles.btnPrimaryText}>{label}</Text>
        </Pressable>
      }
    </>);

}

export function Chip({ label, kind }) {
  const chipViewStyle = () => {
    if (kind === "brand") {
      return [styles.chipBase, styles.chipBrand];
    }
    return [styles.chipBase];
  };

  const chipLabelStyle = () => {
    if (kind === "brand") {
      return [styles.chipText, styles.chipTextBrand];
    }
    return [styles.chipText];
  };


  let vs = chipViewStyle();
  let ls = chipLabelStyle();

  return (
    <View accessibilityLabel={label} style={vs}>
      <Text style={ls}>{label}</Text>
    </View>);

}

export function ProgressRing({ progress, size, strokeWidth, color, bgColor, children }) {
  const sz = useMemo(() => size || 120, [size]);
  const sw = useMemo(() => strokeWidth || 10, [strokeWidth]);
  const clr = useMemo(() => color || brand, [color]);
  const bgc = useMemo(() => bgColor || "rgba(255,255,255,0.08)", [bgColor]);
  const p = useMemo(() => Math.max(0, Math.min(1, progress || 0)), [progress]);
  const pct = useMemo(() => Math.round(p * 100), [p]);
  const radius = useMemo(() => (sz - sw) / 2, [sz, sw]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const dashoffset = useMemo(() => circumference * (1 - p), [circumference, p]);
  const halfSz = useMemo(() => sz / 2, [sz]);
  const dashArray = useMemo(() => circumference + " " + circumference, [circumference]);
  const svgRotate = useMemo(() => "rotate(-90 " + halfSz + " " + halfSz + ")", [halfSz]);

  return (
    <View style={{ width: sz, height: sz, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`Progress: ${pct}%`} accessibilityRole={"progressbar"}>
      <Svg.default width={sz} height={sz} style={{ position: "absolute" }}>
        <Svg.Circle cx={halfSz} cy={halfSz} r={radius} stroke={bgc} strokeWidth={sw} fill={"none"} />
        <Svg.Circle cx={halfSz} cy={halfSz} r={radius} stroke={clr} strokeWidth={sw} fill={"none"} strokeLinecap={"round"} strokeDasharray={dashArray} strokeDashoffset={dashoffset} transform={svgRotate} />
      </Svg.default>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>);

}

const styles = StyleSheet.create({
  btnPrimaryPressed: {
    opacity: 0.75
  },
  btnPrimaryText: {
    color: "#081019",
    fontWeight: "900"
  },
  btnPrimary: {
    backgroundColor: "#2dd4bf",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center"
  },
  chipText: {
    color: "rgba(255,255,255,0.68)",
    fontWeight: "900",
    fontSize: 12
  },
  cardBase: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center"
  },
  btnGhostPressed: {
    opacity: 0.6
  },
  btnGhostText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900"
  },
  chipBase: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start"
  },
  chipBrand: {
    borderColor: "rgba(45,212,191,0.55)",
    backgroundColor: "rgba(45,212,191,0.15)"
  },
  chipTextBrand: {
    color: "rgba(255,255,255,0.92)"
  },
  screenBase: {
    flex: 1,
    backgroundColor: "#0b1020",
    padding: 16
  },
  titleBase: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 22,
    fontWeight: "900"
  },
  mutedBase: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18
  }
});
