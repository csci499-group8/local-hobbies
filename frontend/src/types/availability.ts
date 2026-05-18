import { GeoJsonPoint } from './common';

export enum AvailabilityType {
    OneTimeAvailability = 'One-time availability',
    RecurringAvailability = 'Recurring availability',
    AvailabilityException = 'Availability exception',
}

export enum AvailabilityFrequency {
    Weekly = 'Weekly',
    EveryTwoWeeks = 'Every two weeks',
    Monthly = 'Monthly',
}

export enum DayOfWeek {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
}

/**
 * OneTimeAvailability types
 */

export interface OneTimeAvailabilityCreationRequest {
    location: GeoJsonPoint;
    /** ISO 8601 date */
    date: string;
    /** ISO 8601 time (HH:mm) */
    startTime: string;
    /** ISO 8601 duration (e.g., PT3H) */
    duration: string;
}

export interface OneTimeAvailabilityUpdateRequest {
    location?: GeoJsonPoint;
    /** ISO 8601 date */
    date?: string;
    /** ISO 8601 time (HH:mm) */
    startTime?: string;
    /** ISO 8601 duration */
    duration?: string;
}

export interface OneTimeAvailabilityResponse {
    id: string;
    location: GeoJsonPoint;
    /** ISO 8601 date */
    date: string;
    /** ISO 8601 time (HH:mm) */
    startTime: string;
    /** ISO 8601 duration */
    duration: string;
}

/**
 * RecurringAvailability types
 */

export interface RecurringAvailabilityCreationRequest {
    location: GeoJsonPoint;
    /** ISO 8601 date (YYYY-MM-DD) */
    ruleStart: string;
    /** ISO 8601 date. Nullable if rule continues indefinitely */
    ruleEnd?: string | null;
    frequency: AvailabilityFrequency;
    startDayOfWeek?: DayOfWeek | null;
    startDayOfMonth?: number | null;
    /** ISO 8601 time (HH:mm) */
    startTime: string;
    /** ISO 8601 duration */
    duration: string;
}

export interface RecurringAvailabilityUpdateRequest {
    location?: GeoJsonPoint;
    /** ISO 8601 date */
    ruleStart?: string;
    /** ISO 8601 date */
    ruleEnd?: string | null;
    frequency?: AvailabilityFrequency;
    startDayOfWeek?: DayOfWeek | null;
    startDayOfMonth?: number | null;
    /** ISO 8601 time */
    startTime?: string;
    /** ISO 8601 duration */
    duration?: string;
}

export interface RecurringAvailabilityResponse {
    id: string;
    location: GeoJsonPoint;
    /** ISO 8601 date */
    ruleStart: string;
    /** ISO 8601 date */
    ruleEnd: string | null;
    frequency: AvailabilityFrequency;
    startDayOfWeek: DayOfWeek | null;
    startDayOfMonth: number | null;
    /** ISO 8601 time */
    startTime: string;
    /** ISO 8601 duration */
    duration: string;
}

/**
 * AvailabilityException types
 */

export interface AvailabilityExceptionCreationRequest {
    recurringAvailabilityId: string;
    /** ISO 8601 date */
    exceptionDate: string;
    exceptionReason?: string | null;
    isCancelled: boolean;
    overrideLocation?: GeoJsonPoint | null;
    /** ISO 8601 time */
    overrideStartTime?: string | null;
    /** ISO 8601 duration */
    overrideDuration?: string | null;
}

export interface AvailabilityExceptionOnboardingCreationRequest {
    /** ISO 8601 date */
    exceptionDate: string;
    exceptionReason?: string | null;
    isCancelled: boolean;
    overrideLocation?: GeoJsonPoint | null;
    /** ISO 8601 time */
    overrideStartTime?: string | null;
    /** ISO 8601 duration */
    overrideDuration?: string | null;
}

export interface AvailabilityExceptionUpdateRequest {
    exceptionReason?: string | null;
    isCancelled?: boolean;
    overrideLocation?: GeoJsonPoint | null;
    /** ISO 8601 time */
    overrideStartTime?: string | null;
    /** ISO 8601 duration */
    overrideDuration?: string | null;
}

export interface AvailabilityExceptionResponse {
    id: string;
    recurringAvailabilityId: string;
    /** ISO 8601 date */
    exceptionDate: string;
    exceptionReason: string;
    isCancelled: boolean;
    overrideLocation: GeoJsonPoint | null;
    /** ISO 8601 time */
    overrideStartTime: string | null;
    /** ISO 8601 duration */
    overrideDuration: string | null;
}

/**
 * Aggregate or flattened availability types
 */

export interface RecurringAvailabilityWithExceptions {
    recurring: RecurringAvailabilityCreationRequest;
    exceptions: AvailabilityExceptionOnboardingCreationRequest[];
}

export interface AvailabilityOnboardingRequests {
    oneTimes: OneTimeAvailabilityCreationRequest[];
    recurringsWithExceptions: RecurringAvailabilityWithExceptions[];
}

export interface ScheduleResponse {
    intervals: AvailabilityIntervalResponse[];
    availabilities: {
        oneTimes: OneTimeAvailabilityResponse[];
        recurrings: RecurringAvailabilityResponse[];
        exceptions: AvailabilityExceptionResponse[];
    };
}

export interface AvailabilityIntervalResponse {
    sourceType: AvailabilityType;
    sourceId: string;
    location: GeoJsonPoint;
    /** ISO 8601 UTC timestamp */
    start: string;
    /** ISO 8601 UTC timestamp */
    end: string;
}

export interface AvailabilityOverlapResponse {
    distanceKilometers: number;
    /** ISO 8601 UTC timestamp */
    start: string;
    /** ISO 8601 UTC timestamp */
    end: string;
}