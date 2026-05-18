// Allows selection of any duration in [15 minutes, 7 days) using
// separate days, hours, and minutes fields.

import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, HelperText} from 'react-native-paper';
import {colors, spacing} from '@/src/theme';

export interface DurationValue {
    days: number;
    hours: number;
    minutes: number;
}

interface Props {
    value: DurationValue;
    onChange: (value: DurationValue) => void;
    error?: string;
    disabled?: boolean;
}

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const FIELD_CLAMP_MESSAGES: Record<keyof DurationValue, string> = {
    days: 'Days must be an integer between 0 and 6',
    hours: 'Hours must be an integer between 0 and 23',
    minutes: 'Minutes must be an integer between 0 and 59',
};

export const DurationPicker = ({value, onChange, error, disabled}: Props) => {
    const [clampWarning, setClampWarning] = useState<string | null>(null);

    const handleUpdate = (part: keyof DurationValue, text: string, max: number) => {
        const raw = parseInt(text, 10);
        const num = isNaN(raw) ? 0 : clamp(raw, 0, max);
        setClampWarning(text !== '' && (isNaN(raw) || raw !== num) ? FIELD_CLAMP_MESSAGES[part] : null);
        onChange({ ...value, [part]: num });
    };

    return (
        <View style={styles.container}>
            <View style={styles.fields}>
                <TextInput
                    label="Days"
                    value={value.days === 0 ? '' : value.days.toString()}
                    placeholder="0"
                    onChangeText={(t) => handleUpdate('days', t, 6)}
                    mode="outlined"
                    keyboardType="number-pad"
                    disabled={disabled}
                    error={!!error}
                    style={styles.input}
                />

                <TextInput
                    label="Hours"
                    value={value.hours === 0 ? '' : value.hours.toString()}
                    placeholder="0"
                    onChangeText={(t) => handleUpdate('hours', t, 23)}
                    mode="outlined"
                    keyboardType="number-pad"
                    disabled={disabled}
                    error={!!error}
                    style={styles.input}
                />

                <TextInput
                    label="Mins"
                    value={value.minutes === 0 ? '' : value.minutes.toString()}
                    placeholder="0"
                    onChangeText={(t) => handleUpdate('minutes', t, 59)}
                    mode="outlined"
                    keyboardType="number-pad"
                    disabled={disabled}
                    error={!!error}
                    style={styles.input}
                />
            </View>

            {(error || clampWarning) && (
                <HelperText type="error">{error ?? clampWarning}</HelperText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {gap: spacing.xs},
    fields: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
    input: {flex: 1},
    unit: {color: colors.textMuted},
});