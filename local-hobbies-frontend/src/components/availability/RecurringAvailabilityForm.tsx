import React, {useState} from 'react';
import {View, StyleSheet, Platform, Alert} from 'react-native';
import {Button, Text, Switch} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {DateTime, Duration} from 'luxon';
import {
    AvailabilityFrequency,
    DayOfWeek,
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityResponse,
    RecurringAvailabilityUpdateRequest,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {useLocationField} from '@/src/hooks/useLocationField';

type FormValues = {
    frequency: AvailabilityFrequency;
    startDayOfWeek: DayOfWeek | '';
    startTime: Date;
    durationHours: number;
    ruleStart: Date;
    hasRuleEnd: boolean;
    ruleEnd: Date;
};

type Props =
    | {mode: 'create'; onSubmit: (req: RecurringAvailabilityCreationRequest) => Promise<void>; onDismiss: () => void; isSubmitting: boolean}
    | {mode: 'edit'; item: RecurringAvailabilityResponse; onSubmit: (req: RecurringAvailabilityUpdateRequest) => Promise<void>; onDismiss: () => void; isSubmitting: boolean};

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8];

export const RecurringAvailabilityForm = (props: Props) => {
    const item = props.mode === 'edit' ? props.item : null;

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const locationField = useLocationField(
        props.mode === 'edit' ? props.item.location : undefined
    );

    const {control, handleSubmit, setValue, watch} = useForm<FormValues>({
        defaultValues: {
            frequency: item?.frequency ?? AvailabilityFrequency.Weekly,
            startDayOfWeek: item?.startDayOfWeek ?? '',
            startTime: item ? DateTime.fromISO(`2000-01-01T${item.startTime}`).toJSDate() : new Date(),
            durationHours: item ? Duration.fromISO(item.duration).as('hours') : 2,
            ruleStart: item ? DateTime.fromISO(item.ruleStart).toJSDate() : new Date(),
            hasRuleEnd: !!item?.ruleEnd,
            ruleEnd: item?.ruleEnd ? DateTime.fromISO(item.ruleEnd).toJSDate() : new Date(),
        },
    });

    const frequency = watch('frequency');
    const startTime = watch('startTime');
    const durationHours = watch('durationHours');
    const ruleStart = watch('ruleStart');
    const hasRuleEnd = watch('hasRuleEnd');
    const ruleEnd = watch('ruleEnd');

    const handleFormSubmit = (values: FormValues) => {
        if (!locationField.location) {
            Alert.alert('Location required', 'Please choose a location for this availability.');
            return;
        }
        const startTimeStr = DateTime.fromJSDate(values.startTime).toFormat('HH:mm');
        const duration = Duration.fromObject({hours: values.durationHours}).toISO()!;
        const ruleStartStr = DateTime.fromJSDate(values.ruleStart).toISODate()!;
        const ruleEndStr = values.hasRuleEnd
            ? DateTime.fromJSDate(values.ruleEnd).toISODate()
            : null;

        if (props.mode === 'create') {
            props.onSubmit({
                location: locationField.location,
                ruleStart: ruleStartStr,
                ruleEnd: ruleEndStr,
                frequency: values.frequency,
                startDayOfWeek: values.startDayOfWeek || null,
                startDayOfMonth: null,
                startTime: startTimeStr,
                duration,
            });
        } else {
            props.onSubmit({
                location: locationField.location,
                ruleStart: ruleStartStr,
                ruleEnd: ruleEndStr,
                frequency: values.frequency,
                startDayOfWeek: values.startDayOfWeek || null,
                startTime: startTimeStr,
                duration,
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add Recurring Availability' : 'Edit Recurring Availability'}
            </Text>

            {/* Frequency */}
            <View style={styles.field}>
                <Text variant="labelLarge">Frequency</Text>
                <Controller
                    control={control}
                    name="frequency"
                    render={({field: {onChange, value}}) => (
                        <View style={styles.pickerBorder}>
                            <Picker selectedValue={value} onValueChange={onChange}>
                                {Object.values(AvailabilityFrequency).map(f => (
                                    <Picker.Item key={f} label={f} value={f} />
                                ))}
                            </Picker>
                        </View>
                    )}
                />
            </View>

            {/* Day of week */}
            <View style={styles.field}>
                <Text variant="labelLarge">Day of week (optional)</Text>
                <Controller
                    control={control}
                    name="startDayOfWeek"
                    render={({field: {onChange, value}}) => (
                        <View style={styles.pickerBorder}>
                            <Picker selectedValue={value} onValueChange={onChange}>
                                <Picker.Item label="Any day" value="" />
                                {Object.values(DayOfWeek).map(d => (
                                    <Picker.Item key={d} label={d} value={d} />
                                ))}
                            </Picker>
                        </View>
                    )}
                />
            </View>

            {/* Start time */}
            <View style={styles.field}>
                <Text variant="labelLarge">Start Time</Text>
                <Button mode="outlined" icon="clock" onPress={() => setShowTimePicker(true)}>
                    {DateTime.fromJSDate(startTime).toLocaleString(DateTime.TIME_SIMPLE)}
                </Button>
                {showTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
                <View style={styles.chipRow}>
                    {DURATION_OPTIONS.map(h => (
                        <Button
                            key={h}
                            mode={durationHours === h ? 'contained' : 'outlined'}
                            compact
                            onPress={() => setValue('durationHours', h)}
                            style={styles.durationButton}
                        >
                            {h}h
                        </Button>
                    ))}
                </View>
            </View>

            {/* Rule start */}
            <View style={styles.field}>
                <Text variant="labelLarge">Starts on</Text>
                <Button mode="outlined" icon="calendar" onPress={() => setShowStartPicker(true)}>
                    {DateTime.fromJSDate(ruleStart).toLocaleString(DateTime.DATE_MED)}
                </Button>
                {showStartPicker && (
                    <DateTimePicker
                        value={ruleStart}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_: DateTimePickerEvent, d?: Date) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (d) setValue('ruleStart', d);
                        }}
                    />
                )}
            </View>

            {/* Rule end toggle */}
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

            {hasRuleEnd && (
                <View style={styles.field}>
                    <Text variant="labelLarge">Ends on</Text>
                    <Button mode="outlined" icon="calendar" onPress={() => setShowEndPicker(true)}>
                        {DateTime.fromJSDate(ruleEnd).toLocaleString(DateTime.DATE_MED)}
                    </Button>
                    {showEndPicker && (
                        <DateTimePicker
                            value={ruleEnd}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={ruleStart}
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
    pickerBorder: {borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden'},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    durationButton: {minWidth: 56},
    switchRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    footer: {flexDirection: 'row', gap: 12, marginTop: 8},
    footerButton: {flex: 1},
});