
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { AppContext } from '../state/context';
import { Screen, Card, Title, Muted, Button } from '../ui/components';
import { brand, textColor, muted } from '../ui/theme';
import * as Location from 'expo-location';
import * as MapView from 'react-native-maps';
export default function LocationPickerScreen({ navigation }) {
  const ctx = useContext(AppContext);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [loading, setLoading] = useState(true);

  const onMapPress = async (event) => {
    let coord = event.nativeEvent.coordinate;
    if (!coord) {
      return null;
    }
    let lat = coord.latitude;
    let lon = coord.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return null;
    }
    setSelectedCoord(coord);
    try {
      let results = await Location.reverseGeocodeAsync(coord);
      if (results.length > 0) {
        let r = results[0];
        setSelectedLabel([r.street, r.city, r.region].filter(Boolean).join(", "));
      } else {
        setSelectedLabel("");
      }
    } catch (error) {
      setSelectedLabel("");
    }
  };

  const onCancel = () => {
    navigation.navigate("Settings");
  };

  const onSave = async () => {
    if (!selectedCoord) {
      Alert.alert("Location", "Tap the map to select your home location.");
      return null;
    }
    try {
      let newHome = { latitude: selectedCoord.latitude, longitude: selectedCoord.longitude, label: selectedLabel || null };
      let newState = Object.assign({}, ctx.state, { home: newHome });
      await ctx.setState(newState);
      Alert.alert("Saved", "Home location set.");
      navigation.navigate("Settings");
    } catch (error) {
      Alert.alert("Location", error?.message || "Could not save");
    }
  };

  const noCoord = useMemo(() => !selectedCoord, [selectedCoord]);

  useEffect(() => {
    async function init() {
      try {
        let permResult = await Location.requestForegroundPermissionsAsync();
        let permStatus = permResult.status;
        if (permStatus === "granted") {
          let pos = await Location.getCurrentPositionAsync({});
          let coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setSelectedCoord(coord);
          try {
            let results = await Location.reverseGeocodeAsync(coord);
            if (results.length > 0) {
              let r = results[0];
              setSelectedLabel([r.street, r.city, r.region].filter(Boolean).join(", "));
            }
          } catch (error) {
            setSelectedLabel("");
          }
        }
      } catch (error) {
        console.log(`Location error: ${error}`);
      }
      setLoading(false);
    }
    init();
  }, []);

  return (
    <Screen>
      <Card>
        <Title>Pick Home Location</Title>
        <Muted style={styles.mutedTopSmall}>Tap the map to set your home. This is used to calculate commute distance.</Muted>
      </Card>
      <View style={styles.spacerMedium} />
      {loading ?
      <Card>
          <ActivityIndicator size={"large"} color={brand} />
          <Muted style={styles.mutedCentered}>Getting your location...</Muted>
        </Card> :

      <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>Map view - tap to select location</Text>
        </View>
      }
      <View style={styles.spacerMedium} />
      <Card>
        {selectedCoord ?
        <>
            <Muted>Selected: {selectedCoord.latitude.toFixed(4)}, {selectedCoord.longitude.toFixed(4)}</Muted>
            {selectedLabel &&
          <Muted style={styles.mutedTopTiny}>{selectedLabel}</Muted>
          }
          </> :

        <Muted>No location selected yet.</Muted>
        }
        <View style={styles.buttonGroup}>
          <Button disabled={noCoord} label={"Save Home Location"} onPress={onSave} />
          <Button kind={"ghost"} label={"Cancel"} onPress={onCancel} />
        </View>
      </Card>
    </Screen>);

}

const styles = StyleSheet.create({
  spacerMedium: {
    height: 12
  },
  mutedCentered: {
    textAlign: "center",
    marginTop: 10
  },
  mapPlaceholder: {
    color: textColor,
    textAlign: "center",
    padding: 40
  },
  mutedTopTiny: {
    marginTop: 4
  },
  buttonGroup: {
    marginTop: 14,
    gap: 10
  },
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center"
  },
  mutedTopSmall: {
    marginTop: 6
  }
});