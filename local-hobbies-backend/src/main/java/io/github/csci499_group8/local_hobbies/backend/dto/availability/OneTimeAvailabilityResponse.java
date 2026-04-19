package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.OffsetDateTime;

public record OneTimeAvailabilityResponse(
    @NotNull Integer id,
    @NotNull Integer userId,
    @Valid @NotNull GeoJsonPoint location,
    @NotNull OffsetDateTime start,
    @NotNull Duration duration
) {}
