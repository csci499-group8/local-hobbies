package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityInterval;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ScheduleResponse(
        @NotNull List<AvailabilityInterval> intervals,
        @NotNull Availabilities availabilities
) {
    /**
     * Availability objects that AvailabilityIntervals map to
     */
    public record Availabilities(
        @Valid @NotNull List<OneTimeAvailabilityResponse> oneTimes,
        @Valid @NotNull List<RecurringAvailabilityResponse> recurrings,
        @Valid @NotNull List<AvailabilityExceptionResponse> exceptions
    ) {}
}
