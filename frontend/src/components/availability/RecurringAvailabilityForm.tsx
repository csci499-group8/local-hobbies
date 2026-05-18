import React, {useState} from 'react';
import {View, StyleSheet, Platform, Alert, ScrollView} from 'react-native';
import {Button, Text, Switch, HelperText, Menu} from 'react-native-paper';
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
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityUpdateRequest,
    RecurringAvailabilityResponse,
    AvailabilityFrequency,
    DayOfWeek,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {LocationPicker} from '@/src/components/location/LocationPicker';
import {useLocationField} from '@/src/hooks/useLocationField';
import {DurationPicker, DurationValue} from '@/src/components/availability/DurationPicker';
import {spacing, commonStyles, colors, theme} from '@/src/theme';

// Frequencies that require day of week selection
const WEEKLY_FREQUENCIES: AvailabilityFrequency[] = [
    AvailabilityFrequency.Weekly,
    AvailabilityFrequency.EveryTwoWeeks,
];

type FormValues = {
    frequency: AvailabilityFrequency;
    startDayOfWeek: DayOfWeek | '';
    startDayOfMonth: number | '';
    startTime: Date;
    duration: DurationValue;
    ruleStart: Date;
    hasRuleEnd: boolean;
    ruleEnd: Date;
};

type Props =
    | {
        mode: 'create';
        inlineLocation?: boolean;
        onSubmit: (req: RecurringAvailabilityCreationRequest) => Promise<void> | void; //'void' return is for OnboardingAvailabilityStep calls
        onDismiss: () => void;
        isSubmitting: boolean;
      }
    | {
        mode: 'edit';
        item: RecurringAvailabilityResponse;
        inlineLocation?: boolean;
        onSubmit: (req: RecurringAvailabilityUpdateRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      };

export const RecurringAvailabilityForm = (props: Props) => {
    const item = props.mode === 'edit' ? props.item : null;

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const locationField = useLocationField(
        props.mode === 'edit' ? props.item.location : undefined
    );
    
    // Limit date selection to 180 days in the future
    const maxDate = DateTime.now().plus({days: 180}).toJSDate();

    const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<FormValues>({
        defaultValues: {
            frequency: item?.frequency ?? AvailabilityFrequency.Weekly,
            startDayOfWeek: item?.startDayOfWeek ?? '',
            startDayOfMonth: item?.startDayOfMonth ?? '',
            startTime: item
                ? DateTime.fromISO(`2000-01-01T${item.startTime}`).toJSDate()
                : new Date(),
            duration: item
                ? fromIsoDuration(item.duration)
                : {days: 0, hours: 2, minutes: 0},
            ruleStart: item
                ? DateTime.fromISO(item.ruleStart).toJSDate()
                : new Date(),
            hasRuleEnd: !!item?.ruleEnd,
            ruleEnd: item?.ruleEnd
                ? DateTime.fromISO(item.ruleEnd).toJSDate()
                : new Date(),
        },
    });

    const frequency = watch('frequency');
    const startTime = watch('startTime');
    const duration = watch('duration');
    const ruleStart = watch('ruleStart');
    const hasRuleEnd = watch('hasRuleEnd');
    const ruleEnd = watch('ruleEnd');

    const durationError = validateDuration(duration);
    const isWeeklyFrequency = WEEKLY_FREQUENCIES.includes(frequency);

    // Render location picker inline when inside nested modal context
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
        if (durationError) {
            Alert.alert('Invalid Duration', durationError);
            return;
        }
        if (!locationField.location) {
            Alert.alert('Location required', 'Please choose a location.');
            return;
        }

        // Day field validation for type safety
        if (isWeeklyFrequency && !values.startDayOfWeek) {
            Alert.alert('Day required', 'Please select a day of the week.');
            return;
        }
        if (!isWeeklyFrequency && values.startDayOfMonth === '') {
            Alert.alert('Day required', 'Please select a day of the month.');
            return;
        }

        const request = {
            location: locationField.location,
            ruleStart: DateTime.fromJSDate(values.ruleStart).toISODate()!,
            ruleEnd: values.hasRuleEnd
                ? DateTime.fromJSDate(values.ruleEnd).toISODate()
                : null,
            frequency: values.frequency,
            startDayOfWeek: isWeeklyFrequency
                ? values.startDayOfWeek as DayOfWeek
                : null,
            startDayOfMonth: !isWeeklyFrequency && values.startDayOfMonth !== ''
                ? values.startDayOfMonth as number
                : null,
            startTime: DateTime.fromJSDate(values.startTime).toFormat('HH:mm'),
            duration: toIsoDuration(values.duration),
        };

        props.onSubmit(request);
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create'
                    ? 'Add Recurring Availability'
                    : 'Edit Recurring Availability'}
            </Text>

            {/* Frequency */}
            <View style={styles.field}>
                <Text variant="labelLarge">Frequency</Text>
                <Controller
                    control={control}
                    name="frequency"
                    render={({field: {onChange, value}}) => (
                        <FrequencyMenu
                            value={value}
                            onChange={(val) => {
                                onChange(val);
                                    // Clear day fields when frequency changes
                                    // so user makes a fresh selection for new type
                                setValue('startDayOfWeek', '');
                                setValue('startDayOfMonth', '');
                            }}
                            disabled={props.isSubmitting}
                        />
                    )}
                />
            </View>

            {/* Day of week — weekly and every-two-weeks only */}
            {isWeeklyFrequency && (
                <View style={styles.field}>
                    <Text variant="labelLarge">
                        Day of Week <Text style={styles.required}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="startDayOfWeek"
                        rules={{required: 'Day of week is required'}}
                        render={({field: {onChange, value}}) => (
                            <DayOfWeekMenu
                                value={value}
                                onChange={onChange}
                                disabled={props.isSubmitting}
                            />
                        )}
                    />
                    {errors.startDayOfWeek && (
                        <HelperText type="error">
                            {errors.startDayOfWeek.message}
                        </HelperText>
                    )}
                </View>
            )}

            {/* Day of month — monthly only */}
            {!isWeeklyFrequency && (
                <View style={styles.field}>
                    <Text variant="labelLarge">
                        Day of Month <Text style={styles.required}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="startDayOfMonth"
                        rules={{required: 'Day of month is required'}}
                        render={({field: {onChange, value}}) => (
                            <DayOfMonthMenu
                                value={value}
                                onChange={onChange}
                                disabled={props.isSubmitting}
                            />
                        )}
                    />
                    {errors.startDayOfMonth && (
                        <HelperText type="error">
                            {errors.startDayOfMonth.message}
                        </HelperText>
                    )}
                </View>
            )}

            {/* Start time */}
            <View style={styles.field}>
                <Text variant="labelLarge">Start Time</Text>
                <Button
                    mode="outlined"
                    icon="clock"
                    onPress={() => setShowTimePicker(true)}
                    disabled={props.isSubmitting}
                    style={commonStyles.lightBackground}
                >
                    {DateTime.fromJSDate(startTime).toLocaleString(DateTime.TIME_SIMPLE)}
                </Button>
                {showTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display={TIME_PICKER_DISPLAY}
                        onChange={(_: DateTimePickerEvent, d?: Date) => {
                            setShowTimePicker(Platform.OS === 'ios');
                            if (d) setValue('startTime', d);
                        }}
                    />
                )}
            </View>

            {/* Duration */}
            <View style={styles.field}>
                <Text variant="labelLarge">Duration</Text>
                <Text variant="bodySmall" style={styles.hint}>
                    Duration must be between 15 minutes and 7 days.
                </Text>
                <DurationPicker
                    value={duration}
                    onChange={val => setValue('duration', val)}
                    error={durationError ?? undefined}
                    disabled={props.isSubmitting}
                />
            </View>

            {/* Rule start */}
            <View style={styles.field}>
                <Text variant="labelLarge">Starts on</Text>
                <Text variant="bodySmall" style={styles.hint}>
                    This is the date the recurrence rule starts on, not the day the availability occurs.
                    The date must be within the next 180 days.
                </Text>
                <Button
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setShowStartPicker(true)}
                    disabled={props.isSubmitting}
                    style={commonStyles.lightBackground}
                >
                    {DateTime.fromJSDate(ruleStart).toLocaleString(DateTime.DATE_MED)}
                </Button>
                {showStartPicker && (
                    <DateTimePicker
                        value={ruleStart}
                        mode="date"
                        display={DATE_PICKER_DISPLAY}
                        minimumDate={new Date()}
                        maximumDate={maxDate}
                        onChange={(_: DateTimePickerEvent, d?: Date) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (d) setValue('ruleStart', d);
                        }}
                    />
                )}
            </View>

            {/* Rule end toggle */}
            <View style={styles.field}>
                <View style={styles.switchRow}>
                    <Text variant="bodyMedium">Has end date</Text>
                    <Controller
                        control={control}
                        name="hasRuleEnd"
                        render={({field: {onChange, value}}) => (
                            <Switch value={value} onValueChange={onChange} />
                        )}
                    />
                </View>
                <Text variant="bodySmall" style={styles.hint}>
                    This is the date the recurrence rule ends on, not the day the availability occurs. Recurring availabilities may continue indefinitely.
                </Text>
            </View>

            {hasRuleEnd && (
                <View style={styles.field}>
                    <Text variant="labelLarge">Ends on</Text>
                    <Text variant="bodySmall" style={styles.hint}>
                        Date must be within the next 180 days.
                    </Text>
                    <Button
                        mode="outlined"
                        icon="calendar"
                        onPress={() => setShowEndPicker(true)}
                        disabled={props.isSubmitting}
                        style={commonStyles.lightBackground}
                    >
                        {DateTime.fromJSDate(ruleEnd).toLocaleString(DateTime.DATE_MED)}
                    </Button>
                    {showEndPicker && (
                        <DateTimePicker
                            value={ruleEnd}
                            mode="date"
                            display={DATE_PICKER_DISPLAY}
                            minimumDate={ruleStart}
                            maximumDate={maxDate}
                            onChange={(_: DateTimePickerEvent, d?: Date) => {
                                setShowEndPicker(Platform.OS === 'ios');
                                if (d) setValue('ruleEnd', d);
                            }}
                        />
                    )}
                </View>
            )}

            {/* Location */}
            <View style={styles.field}>
                <Text variant="labelLarge">Location</Text>
                <Button
                    mode="outlined"
                    icon="map-marker"
                    onPress={locationField.openPicker}
                    disabled={props.isSubmitting}
                    style={commonStyles.lightBackground}
                >
                    {locationField.address ?? (locationField.location ? 'Location set' : 'Choose location')}
                </Button>
            </View>

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
                    disabled={props.isSubmitting || !!durationError}
                    style={styles.footerButton}
                >
                    {props.mode === 'create' ? 'Add' : 'Save'}
                </Button>
            </View>

            {/* Use modal when not nested, inline rendering handled above */}
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

// ─── Menu sub-components ───────────────────────────────────────────────────────
// Small inline Menu dropdowns replacing <Picker> for short fixed-length lists.

const FrequencyMenu = ({value, onChange, disabled}: {
    value: AvailabilityFrequency;
    onChange: (v: AvailabilityFrequency) => void;
    disabled: boolean;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <Menu
            visible={open}
            onDismiss={() => setOpen(false)}
            anchor={
                <Button
                    mode="outlined"
                    icon="chevron-down"
                    onPress={() => setOpen(true)}
                    disabled={disabled}
                    contentStyle={menuStyles.buttonContent}
                    style={commonStyles.lightBackground}
                >
                    {value}
                </Button>
            }
        >
            {Object.values(AvailabilityFrequency).map(f => (
                <Menu.Item
                    key={f}
                    title={f}
                    trailingIcon={f === value ? 'check' : undefined}
                    onPress={() => { onChange(f); setOpen(false); }}
                />
            ))}
        </Menu>
    );
};

const DayOfWeekMenu = ({value, onChange, disabled}: {
    value: DayOfWeek | '';
    onChange: (v: DayOfWeek | '') => void;
    disabled: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const label = value || 'Select a day...';
    return (
        <Menu
            visible={open}
            onDismiss={() => setOpen(false)}
            anchor={
                <Button
                    mode="outlined"
                    icon="chevron-down"
                    onPress={() => setOpen(true)}
                    disabled={disabled}
                    contentStyle={menuStyles.buttonContent}
                    style={commonStyles.lightBackground}
                >
                    {label}
                </Button>
            }
        >
            {Object.values(DayOfWeek).map(d => (
                <Menu.Item
                    key={d}
                    title={d}
                    trailingIcon={d === value ? 'check' : undefined}
                    onPress={() => { onChange(d); setOpen(false); }}
                />
            ))}
        </Menu>
    );
};

const DayOfMonthMenu = ({value, onChange, disabled}: {
    value: number | '';
    onChange: (v: number | '') => void;
    disabled: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const label = value !== '' ? value.toString() : 'Select a day...';
    const days = Array.from({length: 31}, (_, i) => i + 1);
    return (
        <Menu
            visible={open}
            onDismiss={() => setOpen(false)}
            anchor={
                <Button
                    mode="outlined"
                    icon="chevron-down"
                    onPress={() => setOpen(true)}
                    disabled={disabled}
                    contentStyle={menuStyles.buttonContent}
                    style={commonStyles.lightBackground}
                >
                    {label}
                </Button>
            }
        >
            <ScrollView style={menuStyles.scrollableMenu}>
                {days.map(d => (
                    <Menu.Item
                        key={d}
                        title={d.toString()}
                        trailingIcon={d === value ? 'check' : undefined}
                        onPress={() => { onChange(d); setOpen(false); }}
                    />
                ))}
            </ScrollView>
        </Menu>
    );
};

const menuStyles = StyleSheet.create({
    buttonContent: {flexDirection: 'row-reverse'},
    scrollableMenu: {maxHeight: 240},
});


const styles = StyleSheet.create({
    container: {gap: spacing.xl},
    title: commonStyles.sectionTitle,
    field: {gap: spacing.sm},
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    required: {color: colors.error},
    hint: {color: theme.colors.tertiaryDark},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
    fullScreen: {flex: 1, minHeight: 500},
});