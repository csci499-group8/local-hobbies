import React, {useState} from 'react';
import {View, StyleSheet, Platform, Alert} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {
    DATE_PICKER_DISPLAY,
    TIME_PICKER_DISPLAY,
    toIsoDuration,
    fromIsoDuration,
    validateDuration,
} from '@/src/utils/date-helpers';
import {DateTime} from 'luxon';
import {
    OneTimeAvailabilityCreationRequest,
    OneTimeAvailabilityUpdateRequest,
    OneTimeAvailabilityResponse,
} from '@/src/types/availability';
import {LocationPickerModal} from '@/src/components/location/LocationPickerModal';
import {LocationPicker} from '@/src/components/location/LocationPicker';
import {useLocationField} from '@/src/hooks/useLocationField';
import {DurationPicker, DurationValue} from '@/src/components/availability/DurationPicker';
import {spacing, commonStyles, theme} from '@/src/theme';

type FormValues = {
    date: Date;
    startTime: Date;
    duration: DurationValue;
};

type Props =
    | {
        mode: 'create';
        inlineLocation?: boolean;
        onSubmit: (req: OneTimeAvailabilityCreationRequest) => Promise<void> | void; //'void' return is for OnboardingAvailabilityStep calls
        onDismiss: () => void;
        isSubmitting: boolean;
      }
    | {
        mode: 'edit';
        item: OneTimeAvailabilityResponse;
        inlineLocation?: boolean;
        onSubmit: (req: OneTimeAvailabilityUpdateRequest) => Promise<void>;
        onDismiss: () => void;
        isSubmitting: boolean;
      };

export const OneTimeAvailabilityForm = (props: Props) => {
    const item = props.mode === 'edit' ? props.item : null;

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const locationField = useLocationField(
        props.mode === 'edit' ? props.item.location : undefined
    );
    
    // Limit date selection to 180 days in the future
    const maxDate = DateTime.now().plus({days: 180}).toJSDate();

    const {handleSubmit, setValue, watch} = useForm<FormValues>({
        defaultValues: {
            date: item ? DateTime.fromISO(item.date).toJSDate() : new Date(),
            startTime: item
                ? DateTime.fromISO(`2000-01-01T${item.startTime}`).toJSDate()
                : new Date(),
            duration: item
                ? fromIsoDuration(item.duration)
                : {days: 0, hours: 2, minutes: 0},
        },
    });

    const date = watch('date');
    const startTime = watch('startTime');
    const duration = watch('duration');
    const durationError = validateDuration(duration);

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
            Alert.alert('Invalid duration', durationError);
            return;
        }
        if (!locationField.location) {
            Alert.alert('Location required', 'Please choose a location for this availability.');
            return;
        }

        const dateStr = DateTime.fromJSDate(values.date).toISODate()!;
        const startTimeStr = DateTime.fromJSDate(values.startTime).toFormat('HH:mm');
        const durationStr = toIsoDuration(values.duration);

        const request = {
            date: dateStr,
            startTime: startTimeStr,
            duration: durationStr,
            location: locationField.location,
        };

        props.onSubmit(request);
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {props.mode === 'create' ? 'Add One-Time Availability' : 'Edit Availability'}
            </Text>

            {/* Date selector */}
            <View style={styles.field}>
                <Text variant="labelLarge">Date</Text>
                <Text variant="bodySmall" style={styles.hint}>
                    Date must be within the next 180 days.
                </Text>
                <Button
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setShowDatePicker(true)}
                    disabled={props.isSubmitting}
                    style={commonStyles.lightBackground}
                >
                    {DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)}
                </Button>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={DATE_PICKER_DISPLAY}
                        minimumDate={new Date()}
                        maximumDate={maxDate}
                        onChange={(_: DateTimePickerEvent, d?: Date) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (d) setValue('date', d);
                        }}
                    />
                )}
            </View>

            {/* Time selector */}
            <View style={styles.field}>
                <Text variant="labelLarge">Time</Text>
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

            {/* Duration selector */}
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

const styles = StyleSheet.create({
    container: {gap: spacing.xl},
    title: commonStyles.sectionTitle,
    field: {gap: spacing.sm},
    hint: {color: theme.colors.tertiaryDark},
    footer: commonStyles.footer,
    footerButton: commonStyles.footerButton,
    fullScreen: {flex: 1, minHeight: 500},
});