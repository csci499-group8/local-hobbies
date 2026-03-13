package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

public record OneTimeAvailabilityCreationRequest(
    @NotNull GeoJsonPoint location,
    @NotNull LocalDate startDate,
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {}
