import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Divider} from 'react-native-paper';
import {
    UserOnboardingIncompleteSection,
    OnboardingSectionName,
    IncompleteReason,
} from '@/src/types/user';
import {colors, spacing, commonStyles} from '@/src/theme';

interface OverviewStep {
    name: OnboardingSectionName;
    label: string;
    description: string;
}

const OVERVIEW_STEPS: OverviewStep[] = [
    {
        name: OnboardingSectionName.Name,
        label: 'Display Name',
        description: 'How you appear to other users',
    },
    {
        name: OnboardingSectionName.BirthDate,
        label: 'Date of Birth',
        description: 'Used to verify you are 18 or older', //TODO: age limit? 13??
    },
    {
        name: OnboardingSectionName.Location,
        label: 'Location',
        description: 'Helps find nearby matches',
    },
    {
        name: OnboardingSectionName.PublicContactInfo,
        label: 'Contact Info',
        description: 'Shown to your matches so they can reach you',
    },
    {
        name: OnboardingSectionName.GenderMatched,
        label: 'Matching Gender',
        description: 'Gender used in searches so that others can match with you. This will not ' +
            'be shown to others. You can personalize your displayed gender on your profile',
    },
    {
        name: OnboardingSectionName.ShowAge, //includes showGenderDisplayed because the two are too thin for separate steps
        label: 'Privacy Settings',
        description: 'Controls what appears on your profile',
    },
    {
        name: OnboardingSectionName.Hobbies,
        label: 'Hobbies',
        description: 'What you are matched on',
    },
    {
        name: OnboardingSectionName.Availabilities,
        label: 'Availability',
        description: 'When you are free to meet up',
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
                                <Text variant="bodySmall" style={styles.stepDescription}>
                                    {incomplete && reason
                                        ? REASON_LABELS[reason]
                                        : step.description}
                                </Text>
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
    title: {fontWeight: 'bold', color: colors.textPrimary},
    subtitle: {color: colors.textSecondary, lineHeight: 22},
    previewLabel: {color: colors.textMuted, letterSpacing: 1.5},
    stepList: {gap: spacing.md},
    stepRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberComplete: {backgroundColor: colors.primary, borderColor: colors.primary},
    stepNumberText: {color: colors.primary, fontWeight: 'bold'},
    stepNumberTextComplete: {color: colors.surface, fontWeight: 'bold'},
    stepInfo: {flex: 1, gap: 2},
    stepLabel: {color: colors.textPrimary, fontWeight: '600'},
    stepLabelComplete: {color: colors.textSecondary},
    stepDescription: {color: colors.textMuted},
    doneLabel: {color: colors.primary, fontWeight: '600'},
    button: {marginTop: spacing.sm},
    note: {color: colors.textMuted, textAlign: 'center', lineHeight: 18},
});