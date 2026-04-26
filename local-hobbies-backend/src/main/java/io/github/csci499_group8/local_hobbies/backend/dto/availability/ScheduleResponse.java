package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityInterval;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Lists of all of a user's Availability objects, and the flattened AvailabilityIntervals
 * they are projected to
 */
public record ScheduleResponse(
        @NotNull List<AvailabilityIntervalResponse> intervals, //may be empty
        @NotNull Availabilities availabilities
) {
    public record Availabilities(
        @Valid @NotNull List<OneTimeAvailabilityResponse> oneTimes, //may be empty
        @Valid @NotNull List<RecurringAvailabilityResponse> recurrings, //may be empty
        @Valid @NotNull List<AvailabilityExceptionResponse> exceptions //may be empty
    ) {}
}
