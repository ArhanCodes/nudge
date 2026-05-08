import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button, Chip, Spacer } from '../ui/components';
import { colors } from '../ui/theme';

const HINT = Platform.OS === 'android'
  ? 'Android note: for full Google Maps tiles you may need to add a Google Maps API key later. This MVP still works for picking coordinates.'
  : 'Tip: zoom in and long-press to place your home marker.';

const validCoord = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

export default function LocationPickerScreen({ navigation }) {
  const { state, setState } = useContext(AppContext);
  const [region, setRegion] = useState(null);
  const [picked, setPicked] = useState(null);
  const school = state?.school;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is needed to pick your location on the map.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const initial = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(initial);
      setPicked({ latitude: initial.latitude, longitude: initial.longitude });
    })();
  }, []);

  async function onSave() {
    if (!picked) return;
    await setState({ ...state, home: { ...picked, label: 'Home' } });
    navigation.goBack();
  }

  function onMapLongPress(e) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (validCoord(latitude, longitude)) setPicked({ latitude, longitude });
  }

  return (
    <Screen>
      <Card>
        <Title>Pick home location</Title>
        <Muted style={{ marginTop: 6 }}>
          This stores coordinates locally and uses them to estimate commute distance. We use a straight-line estimate (not driving directions).
        </Muted>
        <View style={{ marginTop: 10 }}><Chip label={HINT} /></View>
      </Card>

      <Spacer />
      <View style={styles.mapWrap}>
        {region ? (
          <MapView style={styles.map} initialRegion={region} onLongPress={onMapLongPress}>
            {picked && <Marker coordinate={picked} title="Home" />}
            {school && (
              <Marker
                coordinate={{ latitude: school.latitude, longitude: school.longitude }}
                title={school.name || 'School'}
                pinColor={colors.brand}
              />
            )}
          </MapView>
        ) : (
          <View style={[styles.map, styles.loading]}>
            <Text style={styles.loadingText}>Loading map…</Text>
          </View>
        )}
      </View>

      <Spacer />
      <Card>
        <Title style={{ fontSize: 18 }}>Selected</Title>
        <Muted style={{ marginTop: 6 }}>
          {picked ? `${picked.latitude.toFixed(5)}, ${picked.longitude.toFixed(5)}` : 'Long-press the map to choose a point.'}
        </Muted>
        <View style={{ marginTop: 12, gap: 10 }}>
          <Button label="Save" onPress={onSave} disabled={!picked} />
          <Button kind="ghost" label="Cancel" onPress={() => navigation.goBack()} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapWrap: { height: 320, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  loadingText: { color: colors.muted, fontWeight: '900' },
});
