import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {UserGenderMatched} from '@/src/types/user';

interface Props {
    initialValue?: UserGenderMatched;
    onComplete: (genderMatched: UserGenderMatched) => void;
    isSubmitting: boolean;
}

export const OnboardingGenderMatchedStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const [selected, setSelected] = useState<UserGenderMatched | null>(initialValue ?? null);

    const handleContinue = () => {
        if (!selected) {
            Alert.alert('Selection required', 'Please select who you want to meet.');
            return;
        }
        onComplete(selected);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                This is used for matching only and is never shown on your profile.
            </Text>
            <View style={styles.options}>
                {Object.values(UserGenderMatched).map(gender => (
                    <Button
                        key={gender}
                        mode={selected === gender ? 'contained' : 'outlined'}
                        onPress={() => setSelected(gender)}
                        disabled={isSubmitting}
                        style={styles.option}
                    >
                        {gender}
                    </Button>
                ))}
            </View>
            <Button
                mode="contained"
                onPress={handleContinue}
                disabled={!selected || isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 24},
    description: {opacity: 0.6, lineHeight: 20},
    options: {gap: 12},
    option: {width: '100%'},
    button: {marginTop: 8},
});