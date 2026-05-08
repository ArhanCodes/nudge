// export. builds a csv of all logs and shares it via the os share sheet

import React, { useContext, useMemo, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Spacer } from '../ui/components';
import { colors } from '../ui/theme';

function escapeCSV(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
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
  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ExportScreen() {
  const { state } = useContext(AppContext);
  const [shared, setShared] = useState(false);

  const logs = state?.logs || [];
  const csv = useMemo(() => logsToCSV(logs), [logs]);
  const stats = useMemo(() => {
    const totalKg = logs.reduce((a, l) => a + (l.co2Kg || 0), 0);
    const days = new Set(logs.map((l) => l.dateISO?.slice(0, 10))).size;
    return { count: logs.length, totalKg, days };
  }, [logs]);

  async function onShare() {
    try {
      await Share.share({ message: csv, title: 'Nudge - Carbon Footprint Data' });
      setShared(true);
    } catch (e) {
      Alert.alert('Export', e?.message || 'Could not share data');
    }
  }

  const empty = logs.length === 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Title>Export Your Data</Title>
          <Muted style={{ marginTop: 6 }}>
            Share your carbon footprint logs as CSV. You can paste this into Google Sheets, Excel, or use it in your EPQ analysis.
          </Muted>
          <View style={styles.statsRow}>
            <StatBox label="Activities" value={stats.count} />
            <StatBox label="Days" value={stats.days} />
            <StatBox label="Total kg" value={stats.totalKg.toFixed(1)} />
          </View>
        </Card>

        <Spacer />
        <Card>
          <Title style={{ fontSize: 16 }}>CSV Preview</Title>
          <View style={styles.previewBox}>
            <Text style={styles.previewText} numberOfLines={12}>{csv || 'No data to export yet.'}</Text>
          </View>
        </Card>

        <Spacer />
        <Card>
          <Button label="Share CSV" onPress={onShare} disabled={empty} />
          {shared && <Muted style={styles.note}>Data shared successfully!</Muted>}
          {empty && <Muted style={styles.note}>Log some activities first to export data.</Muted>}
        </Card>

        <Spacer h={30} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  statValue: { color: colors.brand, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  previewBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10, marginTop: 8 },
  previewText: { color: colors.muted, fontSize: 10, fontFamily: 'monospace', lineHeight: 14 },
  note: { marginTop: 8, textAlign: 'center' },
});
