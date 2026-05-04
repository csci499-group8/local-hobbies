import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, IconButton, Snackbar, Text} from 'react-native-paper';
import MapView, {Region} from 'react-native-maps';
import * as Location from 'expo-location';
import {GeoJsonPoint, GeometryType} from '@/src/types/common';

interface Props {
    initialLocation?: GeoJsonPoint;
    onConfirm: (location: GeoJsonPoint, address: string) => void;
    onDismiss: () => void;
}

//Default fallback region (New York City) if no initial location is provided
const DEFAULT_REGION: Region = {
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

//Formats the raw Expo geocoding result into a human-readable string.
//Handles platform/regional variability in address field availability.
const formatAddress = (r: Location.LocationGeocodedAddress): string => {
    const parts: string[] = [];

    // Prioritize street address
    if (r.streetNumber && r.street) {
        parts.push(`${r.streetNumber} ${r.street}`);
    } else if (r.street) {
        parts.push(r.street);
    } else if (r.name && r.name !== r.district) {
        // Fallback to POI name if it's not just the district name
        parts.push(r.name);
    }

    // Determine city/locality fallback chain
    const city = r.city ?? r.district ?? r.subregion;
    if (city) parts.push(city);

    // Append state/province if distinct from city
    if (r.region && r.region !== city) parts.push(r.region);

    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
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

    //Converts coordinates to a physical address with a 300ms debounce.
    //Debouncing prevents excessive API calls during rapid map scrolling.
    const geocode = useCallback((latitude: number, longitude: number) => {
        // Cancel any in-flight debounce before scheduling a new one
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

        setIsGeocoding(true);
        setAddress(null);

        geocodeTimer.current = setTimeout(async () => {
            try {
                const results = await Location.reverseGeocodeAsync({latitude, longitude});
                setAddress(results.length > 0
                    ? formatAddress(results[0])
                    : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                );
            } catch {
                // Fallback to raw coordinates on error
                setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
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
// above the true center. The container is offset upward by the full pin height
// so the stem tip sits exactly at the map center point.
const PIN_HEAD_SIZE = 24;
const PIN_STEM_HEIGHT = 16;

const styles = StyleSheet.create({
    container: {flex: 1},
    map: {flex: 1},

    pinContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        // Shift the entire pin up so the stem tip sits at the true center.
        // Without this offset the pin head center would be at the map center,
        // which would place the selection point at the middle of the head
        // rather than the tip of the stem.
        justifyContent: 'center',
        marginBottom: PIN_HEAD_SIZE + PIN_STEM_HEIGHT,
    },
    pinHead: {
        width: PIN_HEAD_SIZE,
        height: PIN_HEAD_SIZE,
        borderRadius: PIN_HEAD_SIZE / 2,
        backgroundColor: '#6200ee',
        // Shadow so the pin is visible against any map background
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    pinStem: {
        width: 2,
        height: PIN_STEM_HEIGHT,
        backgroundColor: '#6200ee',
    },

    locationButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        backgroundColor: '#fff',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        gap: 10,
        minHeight: 130,
    },
    hint: {opacity: 0.5, fontStyle: 'italic'},
    geocodingRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    geocodingText: {opacity: 0.6},
    address: {fontWeight: 'bold'},
    buttons: {flexDirection: 'row', gap: 12},
    button: {flex: 1},
});