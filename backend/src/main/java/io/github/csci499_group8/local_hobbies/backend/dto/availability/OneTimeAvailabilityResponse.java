package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

public record OneTimeAvailabilityResponse(
    @NotNull UUID id,
    @Valid @NotNull GeoJsonPoint location,
    @NotNull LocalDate date,
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {}
