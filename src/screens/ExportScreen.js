import React, { useContext, useMemo, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip } from '../ui/components';
import { colors } from '../ui/theme';

function escapeCSV(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function logsToCSV(logs) {
  const headers = ['Date', 'Category', 'Activity', 'CO2 (kg)', 'Quantity', 'Notes'];
  const rows = logs.map((l) => [
    l.dateISO?.slice(0, 10) ?? '',
    l.category ?? 'transport',
    l.label ?? l.itemKey ?? '',
    (l.co2Kg ?? 0).toFixed(3),
    l.quantity ?? 1,
    l.notes ?? '',
  ]);

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCSV).join(','));
  return csvLines.join('\n');
}

export default function ExportScreen() {
  const { state } = useContext(AppContext);
  const [shared, setShared] = useState(false);

  const logs = state?.logs || [];
  const csv = useMemo(() => logsToCSV(logs), [logs]);

  const stats = useMemo(() => {
    const total = logs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const dates = new Set(logs.map((l) => l.dateISO?.slice(0, 10)));
    return { count: logs.length, totalKg: total, days: dates.size };
  }, [logs]);

  async function onShare() {
    try {
      await Share.share({
        message: csv,
        title: 'Nudge - Carbon Footprint Data',
      });
      setShared(true);
    } catch (e) {
      Alert.alert('Export', e?.message || 'Could not share data');
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Title>Export Your Data</Title>
          <Muted style={{ marginTop: 6 }}>
            Share your carbon footprint logs as CSV. You can paste this into Google Sheets, Excel, or
            use it in your EPQ analysis.
          </Muted>

          <View style={styles.statsRow}>
            <StatBox label="Activities" value={stats.count} />
            <StatBox label="Days" value={stats.days} />
            <StatBox label="Total kg" value={stats.totalKg.toFixed(1)} />
          </View>
        </Card>

        <View style={{ height: 12 }} />

        <Card>
          <Title style={{ fontSize: 16 }}>CSV Preview</Title>
          <View style={styles.previewBox}>
            <Text style={styles.previewText} numberOfLines={12}>
              {csv || 'No data to export yet.'}
            </Text>
          </View>
        </Card>

        <View style={{ height: 12 }} />

        <Card>
          <Button label="Share CSV" onPress={onShare} disabled={logs.length === 0} />
          {shared && (
            <Muted style={{ marginTop: 8, textAlign: 'center' }}>
              Data shared successfully!
            </Muted>
          )}
          {logs.length === 0 && (
            <Muted style={{ marginTop: 8, textAlign: 'center' }}>
              Log some activities first to export data.
            </Muted>
          )}
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  previewText: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});
