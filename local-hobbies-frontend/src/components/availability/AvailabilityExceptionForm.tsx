import React, {useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Button, Text, TextInput, Switch} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {DateTime, Duration} from 'luxon';
import {
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
    AvailabilityExceptionResponse,
    RecurringAvailabilityResponse,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {useLocationField} from '@/src/hooks/useLocationField';

type FormValues = {
    exceptionDate: Date;
    isCancelled: boolean;
    exceptionReason: string;
    overrideStartTime: Date | null;
    overrideDurationHours: number | null;
};

type Props =
    | {
        mode: 'create';
        recurringId: string;
        recurrings: RecurringAvailabilityResponse[];
        onSubmit: (req: AvailabilityExceptionCreationRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      }
    | {
        mode: 'edit';
        item: AvailabilityExceptionResponse;
        onSubmit: (req: AvailabilityExceptionUpdateRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      };

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8];

export const AvailabilityExceptionForm = (props: Props) => {
    const item = props.mode === 'edit' ? props.item : null;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Override location is optional for exceptions — null means
    // "use the parent recurring availability's location"
    const locationField = useLocationField(
        props.mode === 'edit' && item?.overrideLocation
            ? item.overrideLocation
            : undefined
    );

    const {control, handleSubmit, setValue, watch} = useForm<FormValues>({
        defaultValues: {
            exceptionDate: item ? DateTime.fromISO(item.exceptionDate).toJSDate() : new Date(),
            isCancelled: item?.isCancelled ?? false,
            exceptionReason: item?.exceptionReason ?? '',
            overrideStartTime: item?.overrideStartTime
                ? DateTime.fromISO(`2000-01-01T${item.overrideStartTime}`).toJSDate()
                : null,
            overrideDurationHours: item?.overrideDuration
                ? Duration.fromISO(item.overrideDuration).as('hours')
                : null,
        },
    });

    const isCancelled = watch('isCancelled');
    const exceptionDate = watch('exceptionDate');
    const overrideStartTime = watch('overrideStartTime');
    const overrideDurationHours = watch('overrideDurationHours');

    const handleFormSubmit = (values: FormValues) => {
        const overrideStartTimeStr = values.overrideStartTime
            ? DateTime.fromJSDate(values.overrideStartTime).toFormat('HH:mm')
            : null;
        const overrideDuration = values.overrideDurationHours
            ? Duration.fromObject({hours: values.overrideDurationHours}).toISO()
            : null;

        if (props.mode === 'create') {
            props.onSubmit({
                recurringAvailabilityId: props.recurringId,
                exceptionDate: DateTime.fromJSDate(values.exceptionDate).toISODate()!,
                isCancelled: values.isCancelled,
                exceptionReason: values.exceptionReason.trim() || null,
                overrideLocation: locationField.location,
                overrideStartTime: overrideStartTimeStr,
                overrideDuration,
            });
        } else {
            props.onSubmit({
                isCancelled: values.isCancelled,
                exceptionReason: values.exceptionReason.trim() || null,
                overrideLocation: locationField.location,
                overrideStartTime: overrideStartTimeStr,
                overrideDuration,
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add Exception' : 'Edit Exception'}
            </Text>

            {/* Date — create only */}
            {props.mode === 'create' && (
                <View style={styles.field}>
                    <Text variant="labelLarge">Exception Date</Text>
                    <Button mode="outlined" icon="calendar" onPress={() => setShowDatePicker(true)}>
                        {DateTime.fromJSDate(exceptionDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                    </Button>
                    {showDatePicker && (
                        <DateTimePicker
                            value={exceptionDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(_: DateTimePickerEvent, d?: Date) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (d) setValue('exceptionDate', d);
                            }}
                        />
                    )}
                </View>
            )}

            {/* Cancelled toggle */}
            <View style={styles.switchRow}>
                <Text variant="bodyMedium">Cancel this occurrence</Text>
                <Controller
                    control={control}
                    name="isCancelled"
                    render={({field: {onChange, value}}) => (
                        <Switch value={value} onValueChange={onChange} />
                    )}
                />
            </View>

            {/* Reason */}
            <Controller
                control={control}
                name="exceptionReason"
                render={({field: {onChange, value}}) => (
                    <View style={styles.field}>
                        <TextInput
                            label="Reason (optional)"
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                        />
                    </View>
                )}
            />

            {/* Override fields — hidden when cancelled */}
            {!isCancelled && (
                <>
                    {/* Override time */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override start time (optional)</Text>
                        <Button
                            mode={overrideStartTime ? 'outlined' : 'text'}
                            icon="clock"
                            onPress={() => setShowTimePicker(true)}
                        >
                            {overrideStartTime
                                ? DateTime.fromJSDate(overrideStartTime).toLocaleString(DateTime.TIME_SIMPLE)
                                : 'Set override time'}
                        </Button>
                        {showTimePicker && (
                            <DateTimePicker
                                value={overrideStartTime ?? new Date()}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(_: DateTimePickerEvent, d?: Date) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (d) setValue('overrideStartTime', d);
                                }}
                            />
                        )}
                        {overrideStartTime && (
                            <Button mode="text" compact onPress={() => setValue('overrideStartTime', null)}>
                                Clear
                            </Button>
                        )}
                    </View>

                    {/* Override duration */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override duration (optional)</Text>
                        <View style={styles.chipRow}>
                            {DURATION_OPTIONS.map(h => (
                                <Button
                                    key={h}
                                    mode={overrideDurationHours === h ? 'contained' : 'outlined'}
                                    compact
                                    onPress={() => setValue(
                                        'overrideDurationHours',
                                        overrideDurationHours === h ? null : h
                                    )}
                                    style={styles.durationButton}
                                >
                                    {h}h
                                </Button>
                            ))}
                        </View>
                    </View>

                    {/* Override location */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override location (optional)</Text>
                        <Button
                            mode={locationField.location ? 'outlined' : 'text'}
                            icon="map-marker"
                            onPress={locationField.openPicker}
                            disabled={props.isSubmitting}
                        >
                            {locationField.address ?? (locationField.location ? 'Location set' : 'Set override location')}
                        </Button>
                        {locationField.location && (
                            <Button mode="text" compact onPress={locationField.clearLocation}>
                                Clear
                            </Button>
                        )}
                    </View>
                </>
            )}

            <View style={styles.footer}>
                <Button
                    mode="outlined"
                    onPress={props.onDismiss}
                    disabled={props.isSubmitting}
                    style={styles.footerButton}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit(handleFormSubmit)}
                    loading={props.isSubmitting}
                    disabled={props.isSubmitting}
                    style={styles.footerButton}
                >
                    {props.mode === 'create' ? 'Add' : 'Save'}
                </Button>
            </View>

            <LocationPickerModal
                visible={locationField.showPicker}
                initialLocation={locationField.location ?? undefined}
                onConfirm={locationField.handleConfirm}
                onDismiss={locationField.closePicker}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 20},
    title: {fontWeight: 'bold'},
    field: {gap: 8},
    switchRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    durationButton: {minWidth: 56},
    footer: {flexDirection: 'row', gap: 12, marginTop: 8},
    footerButton: {flex: 1},
});