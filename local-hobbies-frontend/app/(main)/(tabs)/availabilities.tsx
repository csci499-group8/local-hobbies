import React, {useState} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {ActivityIndicator, Text, Appbar, FAB, Portal, Modal, Divider} from 'react-native-paper';
import {useAvailability} from '@/src/hooks/useAvailability';
import {useAvailabilityActions} from '@/src/hooks/useAvailabilityActions';
import {AvailabilityCalendar} from '@/src/components/availability/AvailabilityCalendar';
import {OneTimeAvailabilityCard} from '@/src/components/availability/OneTimeAvailabilityCard';
import {RecurringAvailabilityCard} from '@/src/components/availability/RecurringAvailabilityCard';
import {AvailabilityExceptionCard} from '@/src/components/availability/AvailabilityExceptionCard';
import {OneTimeAvailabilityForm} from '@/src/components/availability/OneTimeAvailabilityForm';
import {RecurringAvailabilityForm} from '@/src/components/availability/RecurringAvailabilityForm';
import {AvailabilityExceptionForm} from '@/src/components/availability/AvailabilityExceptionForm';
import {
    OneTimeAvailabilityResponse,
    RecurringAvailabilityResponse,
    AvailabilityExceptionResponse,
} from '@/src/types/availability';

type ModalState =
    | {type: 'CLOSED'}
    | {type: 'ADD_ONE_TIME'}
    | {type: 'EDIT_ONE_TIME'; item: OneTimeAvailabilityResponse}
    | {type: 'ADD_RECURRING'}
    | {type: 'EDIT_RECURRING'; item: RecurringAvailabilityResponse}
    | {type: 'ADD_EXCEPTION'; recurringId: string}
    | {type: 'EDIT_EXCEPTION'; item: AvailabilityExceptionResponse};

export default function AvailabilitiesScreen() {
    const {schedule, scheduleLoading, scheduleError} = useAvailability();
    const actions = useAvailabilityActions();
    const [modalState, setModalState] = useState<ModalState>({type: 'CLOSED'});

    const close = () => setModalState({type: 'CLOSED'});

    if (scheduleLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    if (scheduleError || !schedule) {
        return (
            <View style={styles.centered}>
                <Text variant="bodyLarge">Error loading schedule: {scheduleError}</Text>
            </View>
        );
    }

    const {oneTimes, recurrings, exceptions} = schedule.availabilities;

    return (
        <View style={styles.screen}>
            <Appbar.Header>
                <Appbar.Content title="My Schedule" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.list}>

                {/* Calendar overview */}
                <View style={styles.calendarContainer}>
                    <AvailabilityCalendar mode="schedule" intervals={schedule.intervals} />
                </View>

                <Divider style={styles.divider} />

                {/* One-time availabilities */}
                <Text variant="titleSmall" style={styles.sectionTitle}>One-Time Availabilities</Text>
                {oneTimes.length === 0 && (
                    <Text variant="bodySmall" style={styles.emptyText}>None added yet.</Text>
                )}
                {oneTimes.map(item => (
                    <OneTimeAvailabilityCard
                        key={item.id}
                        item={item}
                        onEdit={() => setModalState({type: 'EDIT_ONE_TIME', item})}
                        onDelete={() => actions.handleDeleteOneTime(item.id)}
                    />
                ))}

                <Divider style={styles.divider} />

                {/* Recurring availabilities */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Recurring Availabilities</Text>
                {recurrings.length === 0 && (
                    <Text variant="bodySmall" style={styles.emptyText}>None added yet.</Text>
                )}
                {recurrings.map(item => (
                    <RecurringAvailabilityCard
                        key={item.id}
                        item={item}
                        onEdit={() => setModalState({type: 'EDIT_RECURRING', item})}
                        onDelete={() => actions.handleDeleteRecurring(item.id)}
                        onAddException={() => setModalState({type: 'ADD_EXCEPTION', recurringId: item.id})}
                    />
                ))}

                <Divider style={styles.divider} />

                {/* Exceptions */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Recurring Availability Exceptions</Text>
                {exceptions.length === 0 && (
                    <Text variant="bodySmall" style={styles.emptyText}>None added yet.</Text>
                )}
                {exceptions.map(item => (
                    <AvailabilityExceptionCard
                        key={item.id}
                        item={item}
                        onEdit={() => setModalState({type: 'EDIT_EXCEPTION', item})}
                        onDelete={() => actions.handleDeleteException(item.id)}
                    />
                ))}

            </ScrollView>

            {/* FAB menu — opens to add one-time or recurring */}
            <FAB
                icon="plus"
                label="Add"
                style={styles.fab}
                onPress={() => setModalState({type: 'ADD_ONE_TIME'})}
            />

            <Portal>
                <Modal
                    visible={modalState.type !== 'CLOSED'}
                    onDismiss={() => !actions.isSubmitting && close()}
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {modalState.type === 'ADD_ONE_TIME' && (
                            <OneTimeAvailabilityForm
                                mode="create"
                                onSubmit={req => actions.handleAddOneTime(req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                        {modalState.type === 'EDIT_ONE_TIME' && (
                            <OneTimeAvailabilityForm
                                mode="edit"
                                item={modalState.item}
                                onSubmit={req => actions.handleUpdateOneTime(modalState.item.id, req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                        {modalState.type === 'ADD_RECURRING' && (
                            <RecurringAvailabilityForm
                                mode="create"
                                onSubmit={req => actions.handleAddRecurring(req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                        {modalState.type === 'EDIT_RECURRING' && (
                            <RecurringAvailabilityForm
                                mode="edit"
                                item={modalState.item}
                                onSubmit={req => actions.handleUpdateRecurring(modalState.item.id, req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                        {modalState.type === 'ADD_EXCEPTION' && (
                            <AvailabilityExceptionForm
                                mode="create"
                                recurringId={modalState.recurringId}
                                recurrings={recurrings}
                                onSubmit={req => actions.handleAddException(req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                        {modalState.type === 'EDIT_EXCEPTION' && (
                            <AvailabilityExceptionForm
                                mode="edit"
                                item={modalState.item}
                                onSubmit={req => actions.handleUpdateException(modalState.item.id, req, close)}
                                onDismiss={close}
                                isSubmitting={actions.isSubmitting}
                            />
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f8f9fa'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, paddingBottom: 100, gap: 8},
    calendarContainer: {height: 400},
    divider: {marginVertical: 8},
    sectionTitle: {
        fontWeight: 'bold',
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    emptyText: {fontStyle: 'italic', opacity: 0.5},
    fab: {position: 'absolute', margin: 16, right: 0, bottom: 0},
    modal: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 24,
        maxHeight: '85%',
    },
});