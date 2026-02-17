import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted } from '../ui/components';
import { colors } from '../ui/theme';
import { CATEGORIES } from '../lib/co2';
import { getPersonalisedTips, getWorstCategory } from '../lib/tips';
import { weekKeyISO } from '../utils/time';

export default function TipsScreen() {
  const { state } = useContext(AppContext);

  const { tips, worstCat, catTotals } = useMemo(() => {
    const logs = state?.logs || [];
    const now = new Date();
    const wk = weekKeyISO(now);

    const weekLogs = logs.filter((l) => weekKeyISO(new Date(l.dateISO)) === wk);
    const totals = { transport: 0, diet: 0, energy: 0, waste: 0 };
    for (const l of weekLogs) {
      const cat = l.category || 'transport';
      totals[cat] = (totals[cat] || 0) + Math.max(0, l.co2Kg || 0);
    }

    const worst = getWorstCategory(totals);
    const personalised = getPersonalisedTips(totals, 5);

    return { tips: personalised, worstCat: worst, catTotals: totals };
  }, [state]);

  const worstInfo = CATEGORIES[worstCat] || CATEGORIES.transport;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Title>Your Weekly Tips</Title>
          <Muted style={{ marginTop: 6 }}>
            Personalised suggestions based on your activity this week.
          </Muted>

          <View style={styles.worstBox}>
            <Text style={styles.worstIcon}>{worstInfo.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.worstTitle}>
                Focus area: {worstInfo.label}
              </Text>
              <Text style={styles.worstSub}>
                {catTotals[worstCat].toFixed(1)} kg CO₂e this week — your highest category
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 12 }} />

        {tips.map((t, i) => {
          const catInfo = CATEGORIES[t.category] || CATEGORIES.transport;
          return (
            <View key={i}>
              <Card style={{ borderLeftWidth: 3, borderLeftColor: catInfo.color }}>
                <View style={styles.tipHeader}>
                  <Text style={[styles.tipCat, { color: catInfo.color }]}>
                    {catInfo.icon} {catInfo.label}
                  </Text>
                </View>
                <Text style={styles.tipText}>{t.tip}</Text>
              </Card>
              <View style={{ height: 10 }} />
            </View>
          );
        })}

        {tips.length === 0 && (
          <Card>
            <Muted>
              Log some activities this week to get personalised tips!
            </Muted>
          </Card>
        )}

        <View style={{ height: 12 }} />

        <Card>
          <Title style={{ fontSize: 16 }}>Category Summary</Title>
          <View style={{ marginTop: 10 }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <View key={key} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{cat.icon} {cat.label}</Text>
                <Text style={[styles.summaryValue, key === worstCat && { color: '#ef4444', fontWeight: '900' }]}>
                  {(catTotals[key] || 0).toFixed(2)} kg
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  worstBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 12,
  },
  worstIcon: {
    fontSize: 32,
  },
  worstTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  worstSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  tipHeader: {
    marginBottom: 6,
  },
  tipCat: {
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  summaryValue: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 14,
  },
});
