import { DateTime, Duration } from 'luxon';
import {Platform} from 'react-native';
import {DurationValue} from '@/src/components/availability/DurationPicker'

export const DATE_PICKER_DISPLAY = Platform.OS === 'ios' ? 'inline' : 'calendar';
export const TIME_PICKER_DISPLAY = Platform.OS === 'ios' ? 'spinner' : 'spinner';

//helper function for client-side interval computation
export const computeEnd = (start: string, duration: string): string =>
    <string>DateTime.fromISO(start)
        .plus(Duration.fromISO(duration))
        .toISO();

//helper function for formatting Duration
export const formatDuration = (isoString: string): string => {
    const duration = Duration.fromISO(isoString);
    const hours = duration.as('hours');
    if (hours === 1) return '1 hour';
    if (Number.isInteger(hours)) return `${hours} hours`;
    const mins = duration.as('minutes');
    return `${mins} minutes`;
};

export const toIsoDuration = (value: DurationValue): string => {
    return Duration.fromObject(value).toISO() || 'PT0M';
};

export const fromIsoDuration = (iso: string): DurationValue => {
    const dur = Duration.fromISO(iso).shiftTo('days', 'hours', 'minutes').toObject();
    return {
        days: dur.days || 0,
        hours: dur.hours || 0,
        minutes: dur.minutes || 0,
    };
};

export const validateDuration = (value: DurationValue): string | null => {
    const totalMinutes = value.days * 24 * 60 + value.hours * 60 + value.minutes;
    if (totalMinutes < 15) return 'Duration must be at least 15 minutes';
    if (totalMinutes >= 7 * 24 * 60) return 'Duration must be less than 7 days';
    return null;
};