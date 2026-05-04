import React, {useState} from 'react';
import {View, StyleSheet, Platform, Alert} from 'react-native';
import {Button, Text, HelperText} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {DateTime, Duration} from 'luxon';
import {
    OneTimeAvailabilityCreationRequest,
    OneTimeAvailabilityUpdateRequest,
    OneTimeAvailabilityResponse,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {useLocationField} from '@/src/hooks/useLocationField';

type FormValues = {start: Date; durationHours: number};

type Props =
    | {mode: 'create'; onSubmit: (req: OneTimeAvailabilityCreationRequest) => Promise<void>; onDismiss: () => void; isSubmitting: boolean}
    | {mode: 'edit'; item: OneTimeAvailabilityResponse; onSubmit: (req: OneTimeAvailabilityUpdateRequest) => Promise<void>; onDismiss: () => void; isSubmitting: boolean};

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8];

export const OneTimeAvailabilityForm = (props: Props) => {
    const initial = props.mode === 'edit'
        ? DateTime.fromISO(props.item.start).toJSDate()
        : new Date();

    const initialDuration = props.mode === 'edit'
        ? Duration.fromISO(props.item.duration).as('hours')
        : 2;

    const [showPicker, setShowPicker] = useState(false);

    const locationField = useLocationField(
        props.mode === 'edit' ? props.item.location : undefined
    );

    const {handleSubmit, setValue, watch} = useForm<FormValues>({
        defaultValues: {start: initial, durationHours: initialDuration},
    });

    const startValue = watch('start');
    const durationValue = watch('durationHours');

    const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (date) setValue('start', date);
    };

    const handleFormSubmit = (values: FormValues) => {
        if (!locationField.location) {
            Alert.alert('Location required', 'Please choose a location for this availability.');
            return;
        }
        const start = DateTime.fromJSDate(values.start).toISO()!;
        const duration = Duration.fromObject({hours: values.durationHours}).toISO()!;

        if (props.mode === 'create') {
            props.onSubmit({start, duration, location: locationField.location});
        } else {
            props.onSubmit({start, duration, location: locationField.location});
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add One-Time Availability' : 'Edit Availability'}
            </Text>

            {/* Date & time selector */}
            <View style={styles.field}>
                <Text variant="labelLarge">Date & Time</Text>
                <Button
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setShowPicker(true)}
                    disabled={props.isSubmitting}
                >
                    {DateTime.fromJSDate(startValue).toLocaleString(DateTime.DATETIME_MED)}
                </Button>
                {showPicker && (
                    <DateTimePicker
                        value={startValue}
                        mode="datetime"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={handleDateChange}
                    />
                )}
            </View>

            {/* Duration selector */}
            <View style={styles.field}>
                <Text variant="labelLarge">Duration</Text>
                <View style={styles.chipRow}>
                    {DURATION_OPTIONS.map(h => (
                        <Button
                            key={h}
                            mode={durationValue === h ? 'contained' : 'outlined'}
                            compact
                            onPress={() => setValue('durationHours', h)}
                            style={styles.durationButton}
                        >
                            {h}h
                        </Button>
                    ))}
                </View>
            </View>

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
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    durationButton: {minWidth: 56},
    footer: {flexDirection: 'row', gap: 12, marginTop: 8},
    footerButton: {flex: 1},
});