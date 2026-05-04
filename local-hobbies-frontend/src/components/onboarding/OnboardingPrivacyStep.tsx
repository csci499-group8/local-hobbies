//showAge and ShowGenderDisplayed are grouped as "Privacy" because
//the two are too thin for separate steps

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, Switch, List} from 'react-native-paper';

interface Props {
    initialShowAge?: boolean;
    initialShowGenderDisplayed?: boolean;
    onComplete: (showAge: boolean, showGenderDisplayed: boolean) => void;
    isSubmitting: boolean;
}

export const OnboardingPrivacyStep = ({
                                          initialShowAge,
                                          initialShowGenderDisplayed,
                                          onComplete,
                                          isSubmitting,
                                      }: Props) => {
    const [showAge, setShowAge] = useState(initialShowAge ?? true);
    const [showGenderDisplayed, setShowGenderDisplayed] = useState(
        initialShowGenderDisplayed ?? true
    );

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                Choose what appears on your public profile. You can change these later in settings.
            </Text>

            <List.Item
                title="Show age"
                description="Other users will see your age on your profile"
                right={() => (
                    <Switch value={showAge} onValueChange={setShowAge} disabled={isSubmitting} />
                )}
            />
            <List.Item
                title="Show gender"
                description="Other users will see your displayed gender on your profile"
                right={() => (
                    <Switch
                        value={showGenderDisplayed}
                        onValueChange={setShowGenderDisplayed}
                        disabled={isSubmitting}
                    />
                )}
            />

            <Button
                mode="contained"
                onPress={() => onComplete(showAge, showGenderDisplayed)}
                disabled={isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 8},
    description: {opacity: 0.6, lineHeight: 20, marginBottom: 8},
    button: {marginTop: 16},
});