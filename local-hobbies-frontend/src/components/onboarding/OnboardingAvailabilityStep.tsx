// Minimal availability builder for onboarding.
// Uses AvailabilityOnboardingRequests which contains oneTimes and
// recurringsWithExceptions.

import React, {useState} from 'react';
import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import {Button, Text, List, Divider, IconButton} from 'react-native-paper';
import {DateTime, Duration} from 'luxon';
import {
    AvailabilityOnboardingRequests,
    OneTimeAvailabilityCreationRequest,
    RecurringAvailabilityWithExceptions,
} from '@/src/types/availability';
import {OneTimeAvailabilityForm} from '@/src/components/availability/OneTimeAvailabilityForm';
import {RecurringAvailabilityForm} from '@/src/components/availability/RecurringAvailabilityForm';
import {Portal, Modal} from 'react-native-paper';

type ModalState =
    | {type: 'CLOSED'}
    | {type: 'ADD_ONE_TIME'}
    | {type: 'ADD_RECURRING'};

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
    const [modalState, setModalState] = useState<ModalState>({type: 'CLOSED'});

    const handleContinue = () => {
        if (oneTimes.length === 0 && recurrings.length === 0) {
            Alert.alert('Availability required', 'Please add at least one availability window.');
            return;
        }
        onComplete({oneTimes, recurringsWithExceptions: recurrings});
    };

    const totalCount = oneTimes.length + recurrings.length;

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.description}>
                Add when you're free to meet up. This is used to find matches with overlapping schedules.
            </Text>

            {/* Summary of added availabilities */}
            {oneTimes.length > 0 && (
                <View>
                    <Text variant="labelSmall" style={styles.sectionLabel}>One-time</Text>
                    {oneTimes.map((ot, i) => (
                        <List.Item
                            key={i}
                            title={DateTime.fromISO(ot.start).toLocaleString(DateTime.DATETIME_MED)}
                            description={Duration.fromISO(ot.duration).toHuman()}
                            right={props => (
                                <IconButton
                                    {...props}
                                    icon="close"
                                    onPress={() => setOneTimes(prev => prev.filter((_, idx) => idx !== i))}
                                />
                            )}
                        />
                    ))}
                </View>
            )}

            {recurrings.length > 0 && (
                <View>
                    <Text variant="labelSmall" style={styles.sectionLabel}>Recurring</Text>
                    {recurrings.map((r, i) => (
                        <List.Item
                            key={i}
                            title={r.recurring.frequency}
                            description={`${r.recurring.startTime} · ${Duration.fromISO(r.recurring.duration).toHuman()}`}
                            right={props => (
                                <IconButton
                                    {...props}
                                    icon="close"
                                    onPress={() => setRecurrings(prev => prev.filter((_, idx) => idx !== i))}
                                />
                            )}
                        />
                    ))}
                </View>
            )}

            {totalCount > 0 && <Divider />}

            <View style={styles.addRow}>
                <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => setModalState({type: 'ADD_ONE_TIME'})}
                    disabled={isSubmitting}
                    style={styles.addButton}
                >
                    One-time
                </Button>
                <Button
                    mode="outlined"
                    icon="plus"
                    onPress={() => setModalState({type: 'ADD_RECURRING'})}
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

            <Portal>
                <Modal
                    visible={modalState.type !== 'CLOSED'}
                    onDismiss={() => setModalState({type: 'CLOSED'})}
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {modalState.type === 'ADD_ONE_TIME' && (
                            <OneTimeAvailabilityForm
                                mode="create"
                                onSubmit={async req => {
                                    setOneTimes(prev => [...prev, req]);
                                    setModalState({type: 'CLOSED'});
                                }}
                                onDismiss={() => setModalState({type: 'CLOSED'})}
                                isSubmitting={false}
                            />
                        )}
                        {modalState.type === 'ADD_RECURRING' && (
                            <RecurringAvailabilityForm
                                mode="create"
                                onSubmit={async req => {
                                    setRecurrings(prev => [
                                        ...prev,
                                        {recurring: req, exceptions: []},
                                    ]);
                                    setModalState({type: 'CLOSED'});
                                }}
                                onDismiss={() => setModalState({type: 'CLOSED'})}
                                isSubmitting={false}
                            />
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 16},
    description: {opacity: 0.6, lineHeight: 20},
    sectionLabel: {
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    addRow: {flexDirection: 'row', gap: 12},
    addButton: {flex: 1},
    button: {marginTop: 8},
    modal: {backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 24, maxHeight: '85%'},
});