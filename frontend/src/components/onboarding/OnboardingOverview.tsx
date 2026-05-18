import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Divider} from 'react-native-paper';
import {
    UserOnboardingIncompleteSection,
    OnboardingSectionName,
    IncompleteReason,
} from '@/src/types/user';
import {theme, spacing, commonStyles} from '@/src/theme';

interface OverviewStep {
    name: OnboardingSectionName;
    label: string;
}

const OVERVIEW_STEPS: OverviewStep[] = [
    {
        name: OnboardingSectionName.Name,
        label: 'Display Name',
    },
    {
        name: OnboardingSectionName.BirthDate,
        label: 'Date of Birth',
    },
    {
        name: OnboardingSectionName.Location,
        label: 'Location',
    },
    {
        name: OnboardingSectionName.ContactInfo,
        label: 'Contact Info',
    },
    {
        name: OnboardingSectionName.GenderMatched,
        label: 'Matching Gender',
    },
    {
        name: OnboardingSectionName.ShowAge, //includes showGenderDisplayed because the two are too thin for separate steps
        label: 'Privacy Settings',
    },
    {
        name: OnboardingSectionName.Hobbies,
        label: 'Hobbies',
    },
    {
        name: OnboardingSectionName.Availabilities,
        label: 'Availability',
    },
];


const REASON_LABELS: Record<IncompleteReason, string> = {
    [IncompleteReason.NoValue]: 'Not set yet',
    [IncompleteReason.MinCountNotMet]: 'Minimum number of entries not met', //TODO: specify number (h: 3; a: 1)
};

interface Props {
    incompleteSections: UserOnboardingIncompleteSection[];
    onStart: (firstIncompleteIndex: number) => void;
}

export const OnboardingOverview = ({incompleteSections, onStart}: Props) => {
    const incompleteNames = new Set(incompleteSections.map(s => s.name));

    const isStepIncomplete = (step: OverviewStep): boolean => {
        // ShowAge and ShowGenderDisplayed share a step; mark Privacy complete
        // only if neither is incomplete
        if (step.name === OnboardingSectionName.ShowAge) {
            return (
                incompleteNames.has(OnboardingSectionName.ShowAge) ||
                incompleteNames.has(OnboardingSectionName.ShowGenderDisplayed)
            );
        }
        return incompleteNames.has(step.name);
    };

    const firstIncompleteIndex = OVERVIEW_STEPS.findIndex(isStepIncomplete);
    const allComplete = firstIncompleteIndex === -1;
    const incompleteCount = OVERVIEW_STEPS.filter(isStepIncomplete).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                    {allComplete ? 'Ready to go!' : 'Set up your profile'}
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    {allComplete
                        ? 'Your profile is complete. You can start finding matches.'
                        : `Complete ${incompleteCount} remaining ${incompleteCount === 1 ? 'section' : 'sections'} to start matching with others.`}
                </Text>
            </View>

            <Divider />

            <View style={styles.stepList}>
                {OVERVIEW_STEPS.map((step, index) => {
                    const incomplete = isStepIncomplete(step);
                    const reason = incompleteSections.find(s => s.name === step.name)?.reason;

                    return (
                        <View key={step.name} style={styles.stepRow}>
                            {/* Step number */}
                            <View style={[
                                styles.stepNumber,
                                !incomplete && styles.stepNumberComplete,
                            ]}>
                                <Text
                                    variant="labelSmall"
                                    style={incomplete
                                        ? styles.stepNumberText
                                        : styles.stepNumberTextComplete}
                                >
                                    {index + 1}
                                </Text>
                            </View>

                            {/* Step info */}
                            <View style={styles.stepInfo}>
                                <Text
                                    variant="bodyMedium"
                                    style={incomplete
                                        ? styles.stepLabel
                                        : styles.stepLabelComplete}
                                >
                                    {step.label}
                                </Text>
                                {incomplete && reason && (
                                    <Text variant="bodySmall" style={styles.stepDescription}>
                                        {REASON_LABELS[reason]}
                                    </Text>
                                )}
                            </View>

                            {!incomplete && (
                                <Text variant="labelSmall" style={styles.doneLabel}>
                                    Done
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>

            <Divider />

            <Button
                mode="contained"
                onPress={() => onStart(
                    firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex
                )}
                style={styles.button}
            >
                {allComplete ? 'Review' : 'Continue Setup'}
            </Button>

            {!allComplete && (
                <Text variant="bodySmall" style={styles.note}>
                    You can go back and change your answers at any time during setup.
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    header: {gap: spacing.sm},
    title: {fontWeight: 'bold', color: theme.colors.primary},
    subtitle: {color: theme.colors.tertiaryDark, lineHeight: 22},
    previewLabel: commonStyles.mutedText,
    // previewLabel: {color: theme.colors.primary, opacity: 0.6, letterSpacing: 1.5},
    stepList: {gap: spacing.md},
    stepRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberComplete: {backgroundColor: theme.colors.primary, borderColor: theme.colors.primary},
    stepNumberText: {color: theme.colors.primary, fontWeight: 'bold'},
    stepNumberTextComplete: {color: theme.colors.tertiaryDark, fontWeight: 'bold'},
    stepInfo: {flex: 1, gap: 2},
    stepLabel: {color: theme.colors.primary, fontWeight: '600'},
    stepLabelComplete: {color: theme.colors.tertiaryDark},
    stepDescription: commonStyles.mutedText,
    doneLabel: {color: theme.colors.primary, fontWeight: '600'},
    button: {marginTop: spacing.sm},
    note: {color: theme.colors.tertiaryDark, textAlign: 'center', lineHeight: 18},
});