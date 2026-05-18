import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {UserGenderMatched} from '@/src/types/user';
import {spacing, commonStyles} from '@/src/theme';

interface Props {
    initialValue?: UserGenderMatched;
    onComplete: (genderMatched: UserGenderMatched) => void;
    isSubmitting: boolean;
}

export const OnboardingGenderMatchedStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const [selected, setSelected] = useState<UserGenderMatched | null>(initialValue ?? null);

    const handleContinue = () => {
        if (!selected) {
            Alert.alert('Selection required', 'Please select a gender.');
            return;
        }
        onComplete(selected);
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                This is used in searches so that others can match with you. It will not otherwise be shown to other users.
                You can personalize your displayed gender on your profile.
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
    container: {gap: spacing.xxl},
    description: commonStyles.fieldLabel,
    options: {gap: spacing.md},
    option: {width: '100%'},
    button: {marginTop: spacing.sm},
});