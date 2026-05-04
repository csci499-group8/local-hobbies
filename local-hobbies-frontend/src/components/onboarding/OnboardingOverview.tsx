import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, List, Button, useTheme} from 'react-native-paper';
import {
    UserOnboardingIncompleteSection,
    OnboardingSectionName,
    IncompleteReason,
} from '@/src/types/user';

const STEP_LABELS: Record<OnboardingSectionName, string> = {
    [OnboardingSectionName.Name]: 'Display Name',
    [OnboardingSectionName.BirthDate]: 'Date of Birth',
    [OnboardingSectionName.Location]: 'Location',
    [OnboardingSectionName.PublicContactInfo]: 'Contact Info',
    [OnboardingSectionName.GenderMatched]: 'Match Preference',
    [OnboardingSectionName.ShowAge]: 'Privacy Settings',
    [OnboardingSectionName.ShowGenderDisplayed]: 'Privacy Settings',
    [OnboardingSectionName.Hobbies]: 'Hobbies',
    [OnboardingSectionName.Availabilities]: 'Availability',
};

const REASON_LABELS: Record<IncompleteReason, string> = {
    [IncompleteReason.NoValue]: 'Not set',
    [IncompleteReason.MinCountNotMet]: 'Minimum not met',
};

// The steps shown in the overview;
// ShowGenderDisplayed is merged into ShowAge as a single "Privacy" row
// since they share a step in the flow
const OVERVIEW_STEPS: OnboardingSectionName[] = [
    OnboardingSectionName.Name,
    OnboardingSectionName.BirthDate,
    OnboardingSectionName.Location,
    OnboardingSectionName.PublicContactInfo,
    OnboardingSectionName.GenderMatched,
    OnboardingSectionName.ShowAge,
    OnboardingSectionName.Hobbies,
    OnboardingSectionName.Availabilities,
];

interface Props {
    incompleteSections: UserOnboardingIncompleteSection[];
    onStart: (firstIncompleteIndex: number) => void;
}

export const OnboardingOverview = ({incompleteSections, onStart}: Props) => {
    const theme = useTheme();

    const incompleteNames = new Set(incompleteSections.map(s => s.name));

    // ShowAge and ShowGenderDisplayed share a step — mark Privacy complete
    // only if neither is incomplete
    const isStepIncomplete = (step: OnboardingSectionName): boolean => {
        if (step === OnboardingSectionName.ShowAge) {
            return (
                incompleteNames.has(OnboardingSectionName.ShowAge) ||
                incompleteNames.has(OnboardingSectionName.ShowGenderDisplayed)
            );
        }
        return incompleteNames.has(step);
    };

    const firstIncompleteIndex = OVERVIEW_STEPS.findIndex(isStepIncomplete);
    const allComplete = firstIncompleteIndex === -1;

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>
                {allComplete ? 'Everything looks good!' : 'Complete your profile'}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                {allComplete
                    ? 'You\'re ready to start finding matches.'
                    : 'Finish the sections below to start matching.'}
            </Text>

            <View style={styles.list}>
                {OVERVIEW_STEPS.map((step, index) => {
                    const incomplete = isStepIncomplete(step);
                    const reason = incompleteSections.find(s => s.name === step)?.reason;

                    return (
                        <List.Item
                            key={step}
                            title={STEP_LABELS[step]}
                            description={incomplete ? REASON_LABELS[reason!] : 'Complete'}
                            left={props => (
                                <List.Icon
                                    {...props}
                                    icon={incomplete ? 'circle-outline' : 'check-circle'}
                                    color={incomplete ? theme.colors.outline : theme.colors.primary}
                                />
                            )}
                            style={[
                                styles.item,
                                !incomplete && styles.completeItem,
                            ]}
                            titleStyle={incomplete ? undefined : styles.completeTitle}
                        />
                    );
                })}
            </View>

            <Button
                mode="contained"
                onPress={() => onStart(firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex)}
                style={styles.button}
            >
                {allComplete ? 'Review Profile' : 'Continue Setup'}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 16},
    title: {fontWeight: 'bold'},
    subtitle: {opacity: 0.6, lineHeight: 20},
    list: {gap: 4},
    item: {backgroundColor: '#fff', borderRadius: 8, marginBottom: 4},
    completeItem: {opacity: 0.7},
    completeTitle: {textDecorationLine: 'line-through'},
    button: {marginTop: 8},
});