import React, {useState, useMemo} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {ActivityIndicator, Text, Appbar, FAB, Portal, Modal, Divider, ProgressBar} from 'react-native-paper';
import {DateTime} from 'luxon';
import {useAvailability} from '@/src/hooks/useAvailability';
import {useAvailabilityActions} from '@/src/hooks/useAvailabilityActions';
import {AvailabilityCalendar, MAX_CALENDAR_HEIGHT} from '@/src/components/availability/AvailabilityCalendar';
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
    AvailabilityType,
} from '@/src/types/availability';
import {spacing} from "@/src/theme";

type ModalState =
    | {type: 'CLOSED'}
    | {type: 'ADD_ONE_TIME'}
    | {type: 'EDIT_ONE_TIME'; item: OneTimeAvailabilityResponse}
    | {type: 'ADD_RECURRING'}
    | {type: 'EDIT_RECURRING'; item: RecurringAvailabilityResponse}
    | {type: 'ADD_EXCEPTION'; recurringId: string}
    | {type: 'EDIT_EXCEPTION'; item: AvailabilityExceptionResponse};

export default function AvailabilitiesScreen() {
    const {schedule, scheduleLoading, scheduleFetching, scheduleError} = useAvailability();
    const actions = useAvailabilityActions();
    const [modalState, setModalState] = useState<ModalState>({type: 'CLOSED'});
    const [fabOpen, setFabOpen] = useState(false);

    // Extract valid exception dates for each recurring availability
    // by collecting unique dates from schedule.intervals
    const recurringDatesMap = useMemo(() => {
        if (!schedule) return new Map<string, string[]>();
        
        const map = new Map<string, string[]>();
        const {recurrings} = schedule.availabilities;
        
        recurrings.forEach(recurring => {
            const dates = schedule.intervals
                .filter(interval =>
                    interval.sourceType === AvailabilityType.RecurringAvailability &&
                    interval.sourceId === recurring.id
                )
                .map(interval => DateTime.fromISO(interval.start).toISODate()!)
                //for each index, if date first appears at that index, keep that date (prevents duplicates)
                .filter((date, index, self) => self.indexOf(date) === index)
                .sort();
            
            map.set(recurring.id, dates);
        });
        
        return map;
    }, [schedule?.intervals, schedule?.availabilities.recurrings]);

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
                <Appbar.Content title="Schedule" />
            </Appbar.Header>
            
            {/* Show progress bar when refetching */}
            {scheduleFetching && !scheduleLoading && (
                <ProgressBar indeterminate style={styles.progressBar} />
            )}

            <ScrollView
                contentContainerStyle={styles.list}
            >

                {/* Calendar overview */}
                <View>
                {/*<View style={styles.calendarContainer}>*/}
                    <AvailabilityCalendar
                        mode="schedule"
                        intervals={schedule.intervals}
                        maxHeight={MAX_CALENDAR_HEIGHT}
                    />
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
            <FAB.Group
                open={fabOpen}
                visible={true}
                icon={fabOpen ? 'close' : 'plus'}
                actions={[
                    {
                        icon: 'calendar-week-begin',
                        label: 'One-Time',
                        onPress: () => setModalState({type: 'ADD_ONE_TIME'}),
                    },
                    {
                        icon: 'calendar-refresh',
                        label: 'Recurring',
                        onPress: () => setModalState({type: 'ADD_RECURRING'}),
                    },
                ]}
                onStateChange={({open}) => setFabOpen(open)}
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
                                    inlineLocation={true}
                                    onSubmit={req => actions.handleAddOneTime(req, close)}
                                    onDismiss={close}
                                    isSubmitting={actions.isSubmitting}
                                />
                            )}
                            {modalState.type === 'EDIT_ONE_TIME' && (
                                <OneTimeAvailabilityForm
                                    mode="edit"
                                    inlineLocation={true}
                                    item={modalState.item}
                                    onSubmit={req => actions.handleUpdateOneTime(modalState.item.id, req, close)}
                                    onDismiss={close}
                                    isSubmitting={actions.isSubmitting}
                                />
                            )}
                            {modalState.type === 'ADD_RECURRING' && (
                                <RecurringAvailabilityForm
                                    mode="create"
                                    inlineLocation={true}
                                    onSubmit={req => actions.handleAddRecurring(req, close)}
                                    onDismiss={close}
                                    isSubmitting={actions.isSubmitting}
                                />
                            )}
                            {modalState.type === 'EDIT_RECURRING' && (
                                <RecurringAvailabilityForm
                                    mode="edit"
                                    inlineLocation={true}
                                    item={modalState.item}
                                    onSubmit={req => actions.handleUpdateRecurring(modalState.item.id, req, close)}
                                    onDismiss={close}
                                    isSubmitting={actions.isSubmitting}
                                />
                            )}
                            {modalState.type === 'ADD_EXCEPTION' && (
                                <AvailabilityExceptionForm
                                    mode="create"
                                    inlineLocation={true}
                                    recurringId={modalState.recurringId}
                                    recurrings={recurrings}
                                    allowedDates={recurringDatesMap.get(modalState.recurringId) ?? []}
                                    onSubmit={req => actions.handleAddException(req, close)}
                                    onDismiss={close}
                                    isSubmitting={actions.isSubmitting}
                                />
                            )}
                            {modalState.type === 'EDIT_EXCEPTION' && (
                                <AvailabilityExceptionForm
                                    mode="edit"
                                    inlineLocation={true}
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
    screen: {flex: 1},
    progressBar: {height: 3},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {padding: 16, paddingBottom: 100, gap: 8},
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