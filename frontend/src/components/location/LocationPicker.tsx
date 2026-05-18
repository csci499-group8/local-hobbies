import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, IconButton, Snackbar, Text} from 'react-native-paper';
import MapView, {Region} from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import {GeoJsonPoint, GeometryType} from '@/src/types/common';
import {colors, commonStyles, spacing, theme} from '@/src/theme';

// Read the Google Maps API key from the native config baked in at build time.
// Using the REST API directly avoids the expo-location permission requirement
// that would otherwise block reverse geocoding even when location access is denied.
const GOOGLE_MAPS_API_KEY: string =
    Constants.expoConfig?.android?.config?.googleMaps?.apiKey ?? '';

interface Props {
    initialLocation?: GeoJsonPoint;
    onConfirm: (location: GeoJsonPoint, address: string) => void;
    onDismiss: () => void;
}

//Default fallback region (New York City) if no initial location is provided
const DEFAULT_REGION: Region = {
    latitude: 40.7789,
    longitude: -73.9685,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const LocationPicker = ({initialLocation, onConfirm, onDismiss}: Props) => {
    const mapRef = useRef<MapView>(null);
    const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [centerCoords, setCenterCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(
        initialLocation
            ? {
                latitude: initialLocation.coordinates[1],
                longitude: initialLocation.coordinates[0],
            }
            : null
    );

    const [address, setAddress] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    //On mount, request permissions proactively
    useEffect(() => {
        Location.requestForegroundPermissionsAsync().then(({status}) => {
            if (status !== 'granted') setPermissionDenied(true);
        });

        // Cleanup any pending debounce timers on unmount to prevent state
        // updates on unmounted component
        return () => {
            if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        };
    }, []);

    // Converts coordinates to a human-readable address using the Google Maps
    // Geocoding REST API directly. This bypasses expo-location's permission gate;
    // reverse geocoding is a pure network call that does not require device location
    // access. Debounced 300ms to prevent excessive calls during map panning.
    const geocode = useCallback((latitude: number, longitude: number) => {
        // Cancel any in-flight debounce before scheduling a new one
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

        setIsGeocoding(true);
        setAddress(null);

        geocodeTimer.current = setTimeout(async () => {
            const coordFallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            try {
                const url = `https://maps.googleapis.com/maps/api/geocode/json`
                    + `?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                    setAddress(data.results[0].formatted_address);
                } else {
                    // API returned no results (e.g. ocean coordinates) — log response and fall back to raw coordinates
                    console.warn(`Geocoding status warning: ${data.status}`);
                    setAddress(coordFallback);
                }
            } catch (error) {
                // Network failure — log error and fall back to raw coordinates
                console.error('Geocoding network exception:', error);
                setAddress(coordFallback);
            } finally {
                setIsGeocoding(false);
            }
        }, 300);
    }, []);

    //Triggered whenever the map movement stops.
    //Updates the local state and triggers the geocoding request for the new center.
    const handleRegionChangeComplete = useCallback((region: Region) => {
        const {latitude, longitude} = region;
        setCenterCoords({latitude, longitude});
        geocode(latitude, longitude);
    }, [geocode]);

    //Attempts to acquire the device's current GPS position and center the map there.
    const handleUseCurrentLocation = async () => {
        if (permissionDenied) {
            setSnackbarMessage('Location permission was denied. Please enable it in Settings.');
            return;
        }

        setIsLocating(true);
        try {
            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const {latitude, longitude} = pos.coords;
            const region: Region = {latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01};

            mapRef.current?.animateToRegion(region, 400);
            setCenterCoords({latitude, longitude});
            geocode(latitude, longitude);
        } catch {
            setSnackbarMessage('Could not get your location. Try dragging the map instead.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleConfirm = () => {
        if (!centerCoords || !address) return;
        onConfirm(
            {
                geometryType: GeometryType.Point,
                coordinates: [centerCoords.longitude, centerCoords.latitude]
            },
            address
        );
    };

    const initialRegion = initialLocation
        ? {
            latitude: initialLocation.coordinates[1],
            longitude: initialLocation.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }
        : DEFAULT_REGION;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                onRegionChangeComplete={handleRegionChangeComplete}
            />

            {/* Floating pin centered on map — crosshair is the selection point.
                The pin stem's bottom tip must sit at the true center. */}
            <View style={styles.pinContainer} pointerEvents="none">
                <View style={styles.pinHead} />
                <View style={styles.pinStem} />
            </View>

            {/* Current location button */}
            <IconButton
                icon="crosshairs-gps"
                mode="contained"
                style={styles.locationButton}
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <Text variant="bodySmall" style={styles.hint}>
                    Drag the map to position the pin, or tap the GPS button.
                </Text>

                {isGeocoding && (
                    <View style={styles.geocodingRow}>
                        <ActivityIndicator size="small" />
                        <Text variant="bodySmall" style={styles.geocodingText}>
                            Finding address...
                        </Text>
                    </View>
                )}

                {address && !isGeocoding && (
                    <Text variant="bodyMedium" style={styles.address}>{address}</Text>
                )}

                <View style={styles.buttons}>
                    <Button mode="outlined" onPress={onDismiss} style={styles.button}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleConfirm}
                        disabled={!centerCoords || isGeocoding || isLocating}
                        style={styles.button}
                    >
                        Confirm
                    </Button>
                </View>
            </View>

            <Snackbar
                visible={!!snackbarMessage}
                onDismiss={() => setSnackbarMessage(null)}
                duration={4000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

// PIN_HEAD_SIZE and PIN_STEM_HEIGHT determine how far up the pin head sits
// above the true map center. The pinContainer is constrained to MAP_HEIGHT so
// that justifyContent:'center' is relative to the map area only, not the full
// component (which also includes the footer). The stem tip then sits at exactly
// MAP_HEIGHT / 2 when marginBottom equals the total pin height.
const MAP_HEIGHT = 400;
const FOOTER_HEIGHT = 200; // footer min-height; container = MAP_HEIGHT + FOOTER_HEIGHT
const PIN_HEAD_SIZE = 24;
const PIN_STEM_HEIGHT = 16;

const styles = StyleSheet.create({
    container: {height: MAP_HEIGHT + FOOTER_HEIGHT},
    map: {height: MAP_HEIGHT},
    // Absolutely positioned so the stem tip lands exactly at map center.
    // top = MAP_HEIGHT/2 - (PIN_HEAD_SIZE + PIN_STEM_HEIGHT) = 200 - 40 = 160px
    // → pinHead: 160–184px, pinStem: 184–200px, tip at 200px = MAP_HEIGHT/2.
    pinContainer: {
        position: 'absolute',
        top: MAP_HEIGHT / 2 - PIN_HEAD_SIZE - PIN_STEM_HEIGHT,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pinHead: {
        width: PIN_HEAD_SIZE,
        height: PIN_HEAD_SIZE,
        borderRadius: PIN_HEAD_SIZE / 2,
        backgroundColor: colors.pin,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    pinStem: {width: 2, height: PIN_STEM_HEIGHT, backgroundColor: colors.pin},
    locationButton: {position: 'absolute', right: spacing.lg, top: spacing.lg, backgroundColor: theme.colors.primaryLight},
    footer: {backgroundColor: theme.colors.onPrimary, padding: spacing.lg, gap: 10, minHeight: 130},
    hint: commonStyles.mutedText,
    geocodingRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
    geocodingText: {opacity: 0.6},
    address: {fontWeight: 'bold'},
    buttons: {flexDirection: 'row', gap: spacing.md},
    button: {flex: 1},
});