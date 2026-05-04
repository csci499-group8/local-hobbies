import React, {useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Button, TextInput, Text} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTime} from 'luxon';

interface Props {
    initialValue?: string;
    onComplete: (birthDate: string) => void;
    isSubmitting: boolean;
}

export const OnboardingBirthDateStep = ({initialValue, onComplete, isSubmitting}: Props) => {
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(
        initialValue
            ? DateTime.fromISO(initialValue).toJSDate()
            : DateTime.now().minus({years: 25}).toJSDate()
    );

    const formatted = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL);

    return (
        <View style={styles.container}>
            <TextInput
                label="Date of Birth"
                value={formatted}
                onPressIn={() => setShowPicker(true)}
                showSoftInputOnFocus={false}
                mode="outlined"
                disabled={isSubmitting}
                right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
            />
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={DateTime.now().minus({years: 18}).toJSDate()}
                    onChange={(_, selected) => {
                        setShowPicker(Platform.OS === 'ios');
                        if (selected) setDate(selected);
                    }}
                />
            )}
            <Text variant="bodySmall" style={styles.note}>
                You must be at least 18 years old.
            </Text>
            <Button
                mode="contained"
                onPress={() => onComplete(DateTime.fromJSDate(date).toISODate()!)}
                disabled={isSubmitting}
                style={styles.button}
            >
                Continue
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: 16},
    note: {opacity: 0.5},
    button: {marginTop: 8},
});