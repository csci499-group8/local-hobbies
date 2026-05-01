package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

public record OneTimeAvailabilityResponse(
    @NotNull UUID id,
    @Valid @NotNull GeoJsonPoint location,
    @NotNull OffsetDateTime start,
    @NotNull Duration duration
) {}
