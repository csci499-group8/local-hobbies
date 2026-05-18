import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {GeoJsonPoint} from '@/src/types/common';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {spacing, commonStyles} from '@/src/theme';


export const OnboardingLocationStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const [location, setLocation] = useState<GeoJsonPoint | null>(initialValue ?? null);
    const [address, setAddress] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const handleContinue = () => {
        if (!location) {
            Alert.alert('Location required', 'Please choose your location to continue.');
            return;
        }
        onComplete(location);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                Your approximate location is shown on your profile. Your exact location is never shared.
            </Text>

            <Button
                mode={location ? 'outlined' : 'contained'}
                icon="map-marker"
                onPress={() => setShowPicker(true)}
                disabled={isSubmitting}
            >
                {address ?? (location ? 'Location set — tap to change' : 'Choose my location')}
            </Button>

            {location && (
                <Button
                    mode="contained"
                    onPress={handleContinue}
                    disabled={isSubmitting}
                    style={styles.button}
                >
                    Continue
                </Button>
            )}

            <LocationPickerModal
                visible={showPicker}
                initialLocation={location ?? undefined}
                onConfirm={(loc, addr) => {
                    setLocation(loc);
                    setAddress(addr);
                    setShowPicker(false);
                }}
                onDismiss={() => setShowPicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    description: commonStyles.fieldLabel,
    button: {marginTop: spacing.sm},
});
interface Props {
    initialValue?: GeoJsonPoint;
    onComplete: (location: GeoJsonPoint) => void;
    isSubmitting: boolean;
}