import React, {useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Button, Text, TextInput, Switch} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {DateTime} from 'luxon';
import {
    DATE_PICKER_DISPLAY,
    TIME_PICKER_DISPLAY,
    toIsoDuration,
    fromIsoDuration,
    validateDuration,
} from '@/src/utils/date-helpers';
import {
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
    AvailabilityExceptionResponse,
    RecurringAvailabilityResponse,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {LocationPicker} from '@/src/components/location/LocationPicker';
import {useLocationField} from '@/src/hooks/useLocationField';
import {DurationPicker, DurationValue} from '@/src/components/availability/DurationPicker';
import {spacing, commonStyles, theme} from '@/src/theme';

type FormValues = {
    exceptionDate: Date;
    isCancelled: boolean;
    exceptionReason: string;
    overrideStartTime: Date | null;
    overrideDuration: DurationValue | null;
};

type Props =
    | {
        mode: 'create';
        recurringId: string;
        recurrings: RecurringAvailabilityResponse[]; //TODO: why plural?
        allowedDates?: string[]; // ISO date strings (YYYY-MM-DD) - valid exception dates
        inlineLocation?: boolean;
        onSubmit: (req: AvailabilityExceptionCreationRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      }
    | {
        mode: 'edit';
        item: AvailabilityExceptionResponse;
        inlineLocation?: boolean;
        onSubmit: (req: AvailabilityExceptionUpdateRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      };

export const AvailabilityExceptionForm = (props: Props) => {
    const item = props.mode === 'edit' ? props.item : null;

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const locationField = useLocationField(
        props.mode === 'edit' && item?.overrideLocation
            ? item.overrideLocation
            : undefined
    );
    
    // Limit date selection to 180 days in the future
    const maxDate = DateTime.now().plus({days: 180}).toJSDate();

    const {control, handleSubmit, setValue, watch} = useForm<FormValues>({
        defaultValues: {
            exceptionDate: item
                ? DateTime.fromISO(item.exceptionDate).toJSDate()
                : new Date(),
            isCancelled: item?.isCancelled ?? false,
            exceptionReason: item?.exceptionReason ?? '',
            overrideStartTime: item?.overrideStartTime
                ? DateTime.fromISO(`2000-01-01T${item.overrideStartTime}`).toJSDate()
                : null,
            overrideDuration: item?.overrideDuration
                ? fromIsoDuration(item.overrideDuration)
                : null,
        },
    });

    const isCancelled = watch('isCancelled');
    const exceptionDate = watch('exceptionDate');
    const overrideStartTime = watch('overrideStartTime');
    const overrideDuration = watch('overrideDuration');

    const durationError = overrideDuration
        ? validateDuration(overrideDuration)
        : null;

    // Check if selected date is in allowed dates (only for create mode)
    const allowedDates = props.mode === 'create' ? props.allowedDates : undefined;
    const selectedDateStr = DateTime.fromJSDate(exceptionDate).toISODate();
    const isDateAllowed = !allowedDates || !selectedDateStr || allowedDates.includes(selectedDateStr);

    // Inline location picker replaces form content when active
    if (locationField.showPicker && props.inlineLocation) {
        return (
            <View style={styles.fullScreen}>
                <LocationPicker
                    initialLocation={locationField.location ?? undefined}
                    onConfirm={locationField.handleConfirm}
                    onDismiss={locationField.closePicker}
                />
            </View>
        );
    }

    const handleFormSubmit = (values: FormValues) => {
        if (durationError) return; // HelperText already shows the error TODO: no helpertext

        const overrideStartTimeStr = values.overrideStartTime
            ? DateTime.fromJSDate(values.overrideStartTime).toFormat('HH:mm')
            : null;
        const overrideDurationStr = values.overrideDuration
            ? toIsoDuration(values.overrideDuration)
            : null;

        if (props.mode === 'create') {
            props.onSubmit({
                recurringAvailabilityId: props.recurringId,
                exceptionDate: DateTime.fromJSDate(values.exceptionDate).toISODate()!,
                isCancelled: values.isCancelled,
                exceptionReason: values.exceptionReason.trim() || null,
                overrideLocation: locationField.location,
                overrideStartTime: overrideStartTimeStr,
                overrideDuration: overrideDurationStr,
            });
        } else {
            props.onSubmit({
                isCancelled: values.isCancelled,
                exceptionReason: values.exceptionReason.trim() || null,
                overrideLocation: locationField.location,
                overrideStartTime: overrideStartTimeStr,
                overrideDuration: overrideDurationStr,
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add Exception' : 'Edit Exception'}
            </Text>

            {/* Exception date — create only, cannot change date on edit */}
            {props.mode === 'create' && (
                <View style={styles.field}>
                    <Text variant="labelLarge">Exception Date</Text>
                    <Text variant="bodySmall" style={styles.hint}>
                        Date must be a day the recurring availability falls on, and within the next 180 days.
                    </Text>
                    <Button
                        mode="outlined"
                        icon="calendar"
                        onPress={() => setShowDatePicker(true)}
                        disabled={props.isSubmitting}
                        style={commonStyles.lightBackground}
                    >
                        {DateTime.fromJSDate(exceptionDate).toLocaleString(
                            DateTime.DATE_MED_WITH_WEEKDAY
                        )}
                    </Button>
                    {!isDateAllowed && (
                        <Text variant="bodySmall" style={styles.errorText}>
                            This date is not a valid occurrence of the recurring availability.
                        </Text>
                    )}
                    {showDatePicker && (
                        <DateTimePicker
                            value={exceptionDate}
                            mode="date"
                            display={DATE_PICKER_DISPLAY}
                            minimumDate={new Date()}
                            maximumDate={maxDate}
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
                <View style={styles.switchLabel}>
                    <Text variant="bodyMedium">Cancel this occurrence</Text>
                    <Text variant="bodySmall" style={styles.hint}>
                        Cancelling clears all overrides
                    </Text>
                </View>
                <Controller
                    control={control}
                    name="isCancelled"
                    render={({field: {onChange, value}}) => (
                        <Switch
                            value={value}
                            onValueChange={(val) => {
                                onChange(val);
                                // Clear override fields when cancelling;
                                // a cancelled occurrence has no overrides
                                if (val) {
                                    setValue('overrideStartTime', null);
                                    setValue('overrideDuration', null);
                                    locationField.clearLocation();
                                }
                            }}
                        />
                    )}
                />
            </View>

            {/* Exception reason */}
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
                            disabled={props.isSubmitting}
                            style={commonStyles.lightBackground}
                        />
                    </View>
                )}
            />

            {/* Override fields — hidden when cancelled */}
            {!isCancelled && (
                <>
                    {/* Override start time */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override Start Time</Text>
                        {overrideStartTime ? (
                            <View style={styles.overrideRow}>
                                <Button
                                    mode="outlined"
                                    icon="clock"
                                    onPress={() => setShowTimePicker(true)}
                                    disabled={props.isSubmitting}
                                    style={styles.overrideButton}
                                >
                                    {DateTime.fromJSDate(overrideStartTime).toLocaleString(
                                        DateTime.TIME_SIMPLE
                                    )}
                                </Button>
                                <Button
                                    mode="text"
                                    compact
                                    onPress={() => setValue('overrideStartTime', null)}
                                    disabled={props.isSubmitting}
                                >
                                    Clear
                                </Button>
                            </View>
                        ) : (
                            <Button
                                mode="outlined"
                                icon="clock-plus-outline"
                                onPress={() => {
                                    // Set to current time as default when first enabling
                                    setValue('overrideStartTime', new Date());
                                    setShowTimePicker(true);
                                }}
                                disabled={props.isSubmitting}
                                style={commonStyles.lightBackground}
                            >
                                Set override time
                            </Button>
                        )}
                        {showTimePicker && overrideStartTime && (
                            <DateTimePicker
                                value={overrideStartTime}
                                mode="time"
                                display={TIME_PICKER_DISPLAY}
                                onChange={(_: DateTimePickerEvent, d?: Date) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (d) setValue('overrideStartTime', d);
                                }}
                            />
                        )}
                    </View>

                    {/* Override duration */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override Duration</Text>
                        <Text variant="bodySmall" style={styles.hint}>
                            Duration must be between 15 minutes and 7 days.
                        </Text>
                        {overrideDuration ? (
                            <View style={styles.overrideRow}>
                                <View style={styles.overrideButtonNoBackground}>
                                    <DurationPicker
                                        value={overrideDuration}
                                        onChange={val => setValue('overrideDuration', val)}
                                        error={durationError ?? undefined}
                                        disabled={props.isSubmitting}
                                    />
                                </View>
                                <Button
                                    mode="text"
                                    compact
                                    onPress={() => setValue('overrideDuration', null)}
                                    disabled={props.isSubmitting}
                                >
                                    Clear
                                </Button>
                            </View>
                        ) : (
                            <Button
                                mode="outlined"
                                icon="timer-plus-outline"
                                onPress={() =>
                                    setValue('overrideDuration', {days: 0, hours: 2, minutes: 0})
                                }
                                disabled={props.isSubmitting}
                                style={commonStyles.lightBackground}
                            >
                                Set override duration
                            </Button>
                        )}
                    </View>

                    {/* Override location */}
                    <View style={styles.field}>
                        <Text variant="labelLarge">Override Location</Text>
                        {locationField.location ? (
                            <View style={styles.overrideRow}>
                                <Button
                                    mode="outlined"
                                    icon="map-marker"
                                    onPress={locationField.openPicker}
                                    disabled={props.isSubmitting}
                                    style={styles.overrideButton}
                                >
                                    {locationField.address ?? 'Location set'}
                                </Button>
                                <Button
                                    mode="text"
                                    compact
                                    onPress={locationField.clearLocation}
                                    disabled={props.isSubmitting}
                                >
                                    Clear
                                </Button>
                            </View>
                        ) : (
                            <Button
                                mode="outlined"
                                icon="map-marker-plus-outline"
                                onPress={locationField.openPicker}
                                disabled={props.isSubmitting}
                                style={commonStyles.lightBackground}
                            >
                                Set override location
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
                    disabled={props.isSubmitting || !!durationError || !isDateAllowed}
                    style={styles.footerButton}
                >
                    {props.mode === 'create' ? 'Add' : 'Save'}
                </Button>
            </View>

            {!props.inlineLocation && (
                <LocationPickerModal
                    visible={locationField.showPicker}
                    initialLocation={locationField.location ?? undefined}
                    onConfirm={locationField.handleConfirm}
                    onDismiss={locationField.closePicker}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.xl},
    title: commonStyles.sectionTitle,
    field: {gap: spacing.sm},
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
    },
    switchLabel: {flex: 1, gap: spacing.xs},
    hint: {color: theme.colors.tertiaryDark},
    errorText: {color: theme.colors.error},
    overrideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    overrideButton: {flex: 1, ...commonStyles.lightBackground},
    overrideButtonNoBackground: {flex: 1},
    clearButton: {alignSelf: 'flex-start'},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
    fullScreen: {flex: 1, minHeight: 500},
});