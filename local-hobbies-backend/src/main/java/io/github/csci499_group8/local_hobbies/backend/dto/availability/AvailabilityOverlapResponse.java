package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AvailabilityOverlapResponse(
    @NotNull List<Participant> participants,
    @NotNull GeoJsonPoint location,
    @NotNull LocalDate startDate,
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {
    public record Participant(
        @NotNull Integer userId,
        @NotNull Integer availabilityId
    ) {}
}
