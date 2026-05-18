// Minimal availability builder for onboarding.
// Uses AvailabilityOnboardingRequests which contains oneTimes and
// recurringsWithExceptions.

import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text, List, Divider, Chip, IconButton} from 'react-native-paper';
import {DateTime} from 'luxon';
import {
    AvailabilityOnboardingRequests,
    OneTimeAvailabilityCreationRequest,
    RecurringAvailabilityWithExceptions,
    RecurringAvailabilityCreationRequest,
    AvailabilityExceptionOnboardingCreationRequest,
} from '@/src/types/availability';
import {OneTimeAvailabilityForm} from '@/src/components/availability/OneTimeAvailabilityForm';
import {RecurringAvailabilityForm} from '@/src/components/availability/RecurringAvailabilityForm';
import {OnboardingAvailabilityExceptionForm} from '@/src/components/onboarding/OnboardingAvailabilityExceptionForm';
import {fromIsoDuration, validateDuration, formatDuration} from '@/src/utils/date-helpers';
import {theme, commonStyles, spacing} from '@/src/theme';

type ActiveForm =
    | {type: 'NONE'}
    | {type: 'ONE_TIME'}
    | {type: 'RECURRING'}
    | {type: 'EXCEPTION'; recurringIndex: number};

interface Props {
    initialValue?: AvailabilityOnboardingRequests;
    onComplete: (availabilities: AvailabilityOnboardingRequests) => void;
    isSubmitting: boolean;
}

export const OnboardingAvailabilityStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const [oneTimes, setOneTimes] = useState<OneTimeAvailabilityCreationRequest[]>(
        initialValue?.oneTimes ?? []
    );
    const [recurrings, setRecurrings] = useState<RecurringAvailabilityWithExceptions[]>(
        initialValue?.recurringsWithExceptions ?? []
    );
    const [activeForm, setActiveForm] = useState<ActiveForm>({type: 'NONE'});

    const handleContinue = () => {
        if (oneTimes.length === 0 && recurrings.length === 0) {
            Alert.alert('Availability required', 'Please add at least one availability window.');
            return;
        }
        const result = {oneTimes, recurringsWithExceptions: recurrings};
        console.log('Availability step result:', JSON.stringify(result, null, 2));
        onComplete(result);
    };

    const addException = (
        recurringIndex: number,
        exception: AvailabilityExceptionOnboardingCreationRequest
    ) => {
        setRecurrings(prev => prev.map((r, i) =>
            i === recurringIndex
                ? {...r, exceptions: [...r.exceptions, exception]}
                : r
        ));
        setActiveForm({type: 'NONE'});
    };

    const removeException = (recurringIndex: number, exceptionIndex: number) => {
        setRecurrings(prev => prev.map((r, i) =>
            i === recurringIndex
                ? {...r, exceptions: r.exceptions.filter((_, ei) => ei !== exceptionIndex)}
                : r
        ));
    };

    const totalCount = oneTimes.length + recurrings.length;

    if (activeForm.type === 'ONE_TIME') {
        return (
            <View>
                <OneTimeAvailabilityForm
                    mode="create"
                    onSubmit={req => {
                        setOneTimes(prev => [...prev, req]);
                        setActiveForm({type: 'NONE'});
                    }}
                    onDismiss={() => setActiveForm({type: 'NONE'})}
                    isSubmitting={false}
                />
            </View>
        );
    }

    if (activeForm.type === 'RECURRING') {
        return (
            <View>
                <RecurringAvailabilityForm
                    mode="create"
                    onSubmit={req => {
                        setRecurrings(prev => [
                            ...prev,
                            {recurring: req, exceptions: []},
                        ]);
                        setActiveForm({type: 'NONE'});
                    }}
                    onDismiss={() => setActiveForm({type: 'NONE'})}
                    isSubmitting={false}
                />
            </View>
        );
    }

    if (activeForm.type === 'EXCEPTION') {
        const {recurringIndex} = activeForm;
        // const parentRecurring = recurrings[recurringIndex];

        return (
            <View>
                <OnboardingAvailabilityExceptionForm
                    onSubmit={req => addException(recurringIndex, req)}
                    onDismiss={() => setActiveForm({type: 'NONE'})}
                    isSubmitting={false}
                />
            </View>
        );
    }

    // Main list view
    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                Add when you're free to meet up. This is used to find matches with overlapping schedules.
            </Text>
            <Text variant="bodySmall" style={styles.description}>
                Recurring availabilities can have exceptions for dates when your schedule changes.
            </Text>

            {/* One-time availabilities */}
            {oneTimes.length > 0 && (
                <View>
                    <Text variant="labelSmall" style={styles.sectionLabel}>
                        One-time
                    </Text>
                    {oneTimes.map((ot, i) => (
                        <View key={i} style={styles.availabilityBlock}>
                        <List.Item
                            title={DateTime.fromISO(ot.date).toLocaleString(
                                DateTime.DATE_MED_WITH_WEEKDAY
                            )}
                            description={`${ot.startTime} · ${formatDuration(ot.duration)}`}
                            descriptionStyle={commonStyles.mutedText}
                            right={() => (
                                <IconButton
                                    icon="close"
                                    onPress={() =>
                                        setOneTimes(prev =>
                                            prev.filter((_, idx) => idx !== i)
                                        )
                                    }
                                />
                            )}
                            style={styles.availabilityItem}
                        />
                        </View>
                    ))}
                </View>
            )}

            {/* Recurring availabilities with nested exceptions */}
            {recurrings.length > 0 && (
                <View style={styles.recurringsSection}>
                    <Text variant="labelSmall" style={styles.sectionLabel}>
                        Recurring
                    </Text>
                    {recurrings.map((r, ri) => (
                        <View key={ri} style={styles.availabilityBlock}>
                            {/* Recurring header */}
                            <List.Item
                                title={`${r.recurring.frequency}${
                                    r.recurring.startDayOfWeek
                                        ? ` · ${r.recurring.startDayOfWeek}`
                                        : ''
                                }${
                                    r.recurring.startDayOfMonth
                                        ? ` · Day ${r.recurring.startDayOfMonth}`
                                        : ''
                                }`}
                                description={`${r.recurring.startTime} · ${formatDuration(r.recurring.duration)}`}
                                descriptionStyle={commonStyles.mutedText}
                                right={() => (
                                    <IconButton
                                        icon="close"
                                        onPress={() =>
                                            setRecurrings(prev =>
                                                prev.filter((_, idx) => idx !== ri)
                                            )
                                        }
                                    />
                                )}
                                style={styles.availabilityItem}
                            />

                            {/* Exceptions nested under this recurring */}
                            {r.exceptions.length > 0 && (
                                <View style={styles.exceptionsBlock}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.exceptionsLabel}
                                    >
                                        Exceptions
                                    </Text>
                                    {r.exceptions.map((ex, ei) => (
                                        <View key={ei} style={styles.exceptionRow}>
                                            <Chip
                                                compact
                                                style={ex.isCancelled
                                                    ? styles.cancelledChip
                                                    : styles.modifiedChip}
                                            >
                                                {ex.isCancelled ? 'Cancelled' : 'Modified'}
                                            </Chip>
                                            <Text
                                                variant="bodySmall"
                                                style={styles.exceptionDate}
                                            >
                                                {DateTime.fromISO(
                                                    ex.exceptionDate
                                                ).toLocaleString(
                                                    DateTime.DATE_MED_WITH_WEEKDAY
                                                )}
                                            </Text>
                                            <Button
                                                mode="text"
                                                compact
                                                icon="close"
                                                onPress={() => removeException(ri, ei)}
                                            >
                                                {''}
                                            </Button>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add exception button for this recurring */}
                            <Button
                                mode="text"
                                compact
                                icon="plus"
                                onPress={() =>
                                    setActiveForm({
                                        type: 'EXCEPTION',
                                        recurringIndex: ri,
                                    })
                                }
                                style={styles.addExceptionButton}
                            >
                                Add exception
                            </Button>
                        </View>
                    ))}
                </View>
            )}

            {totalCount > 0 && <Divider style={styles.divider} />}

            {/* Add buttons */}
            <View style={styles.addRow}>
                <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => setActiveForm({type: 'ONE_TIME'})}
                    disabled={isSubmitting}
                    style={styles.addButton}
                >
                    One-time
                </Button>
                <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => setActiveForm({type: 'RECURRING'})}
                    disabled={isSubmitting}
                    style={styles.addButton}
                >
                    Recurring
                </Button>
            </View>

            <Button
                mode="contained"
                onPress={handleContinue}
                disabled={totalCount === 0 || isSubmitting}
                style={styles.button}
            >
                {isSubmitting ? 'Submitting...' : 'Finish'}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.lg},
    description: {color: theme.colors.tertiaryDark},
    sectionLabel: {
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    recurringsSection: {gap: spacing.sm},
    availabilityBlock: {
        borderWidth: 1,
        borderColor: theme.colors.tertiaryDark,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    availabilityItem: {backgroundColor: theme.colors.tertiaryLight},
    exceptionsBlock: {paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs},
    exceptionsLabel: {
        ...commonStyles.mutedText,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    exceptionRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
    exceptionDate: {flex: 1, color: theme.colors.tertiaryDark},
    cancelledChip: {backgroundColor: theme.colors.cancelled},
    modifiedChip: {backgroundColor: theme.colors.tertiary},
    addExceptionButton: {alignSelf: 'flex-start', marginLeft: spacing.sm, marginBottom: spacing.xs},
    exceptionHeader: {
        // padding: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.xs,
        // backgroundColor: theme.colors.tertiary,
    },
    exceptionParentLabel: {...commonStyles.mutedText, textTransform: 'uppercase', letterSpacing: 1},
    exceptionParentName: {color: theme.colors.primary, fontWeight: '600'},
    divider: {marginVertical: spacing.sm},
    addRow: {flexDirection: 'row', gap: spacing.md},
    addButton: {flex: 1},
    button: {marginTop: spacing.sm},
});