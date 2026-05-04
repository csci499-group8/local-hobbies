import { DateTime } from 'luxon';
import {
    ScheduleResponse,
    OneTimeAvailabilityResponse,
    AvailabilityExceptionResponse,
    AvailabilityType,
    AvailabilityIntervalResponse,
} from '@/src/types/availability';
import {computeEnd} from "@/src/utils/date-helpers";

/**
 * Retrieving the entire flattened availability schedule is calculation-heavy on
 * the server side, so interval writes are performed client-side where possible.
 */

//one-time helpers

//helper function to add new one-time response and computed interval to state
export const addOneTimeToSchedule = (newOneTime: OneTimeAvailabilityResponse) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;

        const newInterval: AvailabilityIntervalResponse = {
            sourceType: AvailabilityType.OneTimeAvailability,
            sourceId: newOneTime.id,
            location: newOneTime.location,
            start: newOneTime.start,
            end: computeEnd(newOneTime.start, newOneTime.duration),
        };

        return {
            ...prev,
            intervals: [...prev.intervals, newInterval],
            availabilities: {
                ...prev.availabilities,
                oneTimes: [...prev.availabilities.oneTimes, newOneTime],
            },
        };
    };

//helper function to update one-time response and computed interval in state
export const updateOneTimeInSchedule = (updatedOneTime: OneTimeAvailabilityResponse) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;

        const newInterval: AvailabilityIntervalResponse = {
            sourceType: AvailabilityType.OneTimeAvailability,
            sourceId: updatedOneTime.id,
            location: updatedOneTime.location,
            start: updatedOneTime.start,
            end: computeEnd(updatedOneTime.start, updatedOneTime.duration),
        };

        return {
            ...prev,
            intervals: [
                //remove old interval
                ...prev.intervals.filter(i => i.sourceId !== updatedOneTime.id),
                //add new interval
                newInterval,
            ],
            availabilities: {
                ...prev.availabilities,
                oneTimes: prev.availabilities.oneTimes.map(o =>
                    o.id === updatedOneTime.id ? updatedOneTime : o
                ),
            },
        };
    };

//helper function to delete one-time response and interval from state
export const deleteOneTimeFromSchedule = (oneTimeId: string) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;
        return {
            ...prev,
            intervals: prev.intervals.filter(i => i.sourceId !== oneTimeId),
            availabilities: {
                ...prev.availabilities,
                oneTimes: prev.availabilities.oneTimes.filter(o => o.id !== oneTimeId),
            },
        };
    };

//recurring helpers

//helper function to delete recurring response and associated exception responses,
//as well as their intervals, from state
export const deleteRecurringAndExceptionsFromSchedule = (recurringId: string) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;
        //identify associated exceptions
        const exceptionIds = new Set(
            prev.availabilities.exceptions
                .filter(e => e.recurringAvailabilityId === recurringId)
                .map(e => e.id)
        );
        return {
            ...prev,
            //remove intervals
            intervals: prev.intervals.filter(i =>
                i.sourceId !== recurringId && !exceptionIds.has(i.sourceId)
            ),
            //remove responses
            availabilities: {
                ...prev.availabilities,
                recurrings: prev.availabilities.recurrings.filter(r => r.id !== recurringId),
                exceptions: prev.availabilities.exceptions.filter(e => e.recurringAvailabilityId !== recurringId),
            },
        };
    };

//exception helpers

//helper function to add new exception response and replace recurring interval with exception interval
export const addExceptionToSchedule = (newException: AvailabilityExceptionResponse) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;

        //identify parent recurring availability
        const recurring = prev.availabilities.recurrings.find(
            r => r.id === newException.recurringAvailabilityId
        );
        if (!recurring) return prev;

        //remove the recurring interval that falls on the exception date
        const filteredIntervals = prev.intervals.filter(i =>
            !(i.sourceId === recurring.id &&
                DateTime.fromISO(i.start).toISODate() === newException.exceptionDate)
        );

        //for cancellations, remove the interval with no replacement
        if (newException.isCancelled) {
            return {
                ...prev,
                intervals: filteredIntervals,
                availabilities: {
                    ...prev.availabilities,
                    exceptions: [...prev.availabilities.exceptions, newException],
                },
            };
        }

        //for alterations, synthesize a new interval from the exception, falling
        //back on the recurring's values for non-overridden fields

        const startTime = newException.overrideStartTime ?? recurring.startTime;
        const duration = newException.overrideDuration ?? recurring.duration;
        const location = newException.overrideLocation ?? recurring.location;
        const intervalStart = DateTime.fromISO(`${newException.exceptionDate}T${startTime}`, {zone: 'utc'}).toISO()!;

        const newInterval: AvailabilityIntervalResponse = {
            sourceType: AvailabilityType.AvailabilityException,
            sourceId: newException.id,
            location,
            start: intervalStart,
            end: computeEnd(intervalStart, duration),
        };

        return {
            ...prev,
            intervals: [...filteredIntervals, newInterval],
            availabilities: {
                ...prev.availabilities,
                exceptions: [...prev.availabilities.exceptions, newException],
            },
        };
    };

export const updateExceptionInSchedule = (updatedException: AvailabilityExceptionResponse) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;

        const oldException = prev.availabilities.exceptions.find(e => e.id === updatedException.id);
        if (!oldException) return prev;

        const recurring = prev.availabilities.recurrings.find(
            r => r.id === updatedException.recurringAvailabilityId
        );
        if (!recurring) return prev;

        const updatedExceptions = prev.availabilities.exceptions.map(e =>
            e.id === updatedException.id ? updatedException : e
        );

        //if only exceptionReason changed, no interval update needed

        const intervalUnchanged =
            oldException.isCancelled === updatedException.isCancelled &&
            oldException.overrideStartTime === updatedException.overrideStartTime &&
            oldException.overrideDuration === updatedException.overrideDuration &&
            oldException.overrideLocation === updatedException.overrideLocation;

        if (intervalUnchanged) {
            return {
                ...prev,
                availabilities: {
                    ...prev.availabilities,
                    exceptions: updatedExceptions,
                },
            };
        }

        //remove old exception interval
        const filteredIntervals = prev.intervals.filter(i => i.sourceId !== updatedException.id);

        //if exception now cancels availability, remove the exception interval
        if (updatedException.isCancelled) {
            return {
                ...prev,
                intervals: filteredIntervals,
                availabilities: {
                    ...prev.availabilities,
                    exceptions: updatedExceptions,
                },
            };
        }

        //otherwise synthesize an updated exception interval

        const startTime = updatedException.overrideStartTime ?? recurring.startTime;
        const duration = updatedException.overrideDuration ?? recurring.duration;
        const location = updatedException.overrideLocation ?? recurring.location;
        const intervalStart = DateTime.fromISO(`${updatedException.exceptionDate}T${startTime}`, {zone: 'utc'}).toISO()!;

        const updatedInterval: AvailabilityIntervalResponse = {
            sourceType: AvailabilityType.AvailabilityException,
            sourceId: updatedException.id,
            location,
            start: intervalStart,
            end: computeEnd(intervalStart, duration),
        };

        return {
            ...prev,
            intervals: [...filteredIntervals, updatedInterval],
            availabilities: {
                ...prev.availabilities,
                exceptions: updatedExceptions,
            },
        };
    };

//helper function to delete exception response and interval from state, and replace
//interval with recurring interval
export const deleteExceptionFromSchedule = (exceptionId: string) =>
    (prev: ScheduleResponse | undefined): ScheduleResponse | undefined => {
        if (!prev) return prev;

        const exception = prev.availabilities.exceptions.find(e => e.id === exceptionId);
        if (!exception) return prev;

        const recurring = prev.availabilities.recurrings.find(
            r => r.id === exception.recurringAvailabilityId
        );
        if (!recurring) return prev;

        //create recurring interval for the exception date

        const intervalStart = DateTime.fromISO(
            `${exception.exceptionDate}T${recurring.startTime}`, {zone: 'utc'}
        ).toISO()!;

        const recurringInterval: AvailabilityIntervalResponse = {
            sourceType: AvailabilityType.RecurringAvailability,
            sourceId: recurring.id,
            location: recurring.location,
            start: intervalStart,
            end: computeEnd(intervalStart, recurring.duration),
        };

        return {
            ...prev,
            intervals: [
                //remove exception interval
                ...prev.intervals.filter(i => i.sourceId !== exceptionId),
                //add recurring interval
                recurringInterval
            ],
            availabilities: {
                ...prev.availabilities,
                exceptions: prev.availabilities.exceptions.filter(e => e.id !== exceptionId),
            },
        };
    };