# School Carbon Footprint Dashboard

Expo / React Native app:
- Students log their commute transport method
- Estimates CO₂ impact (kg) per day (round trip)
- Shows weekly trends + compares to a target
- Lets students pick their home location on a map (coordinates stored locally)

## How Google Maps is used
This MVP uses `react-native-maps` for a map view (students long-press to pick their location).

- iOS: works out of the box
- Android: Google tiles may require adding a Google Maps API key later

To avoid needing paid APIs, the app **does not call the Google Directions API**. It estimates distance using straight-line distance (Haversine) inflated slightly.

## Run

```bash
cd school-carbon-dashboard
npm install
npx expo start
```

Then install **Expo Go** on your phone and scan the QR.

## To do
- Use Google Places Autocomplete for address search (needs API key)
- Use Directions API / route distance instead of straight-line distance
- Multi-student accounts + shared dashboard backend
- Teacher admin view
