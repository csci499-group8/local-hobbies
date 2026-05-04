import { DateTime, Duration } from 'luxon';

//helper function for client-side interval computation
export const computeEnd = (start: string, duration: string): string =>
    <string>DateTime.fromISO(start)
        .plus(Duration.fromISO(duration))
        .toISO();