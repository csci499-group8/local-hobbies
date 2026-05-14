package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AvailabilityOverlapResponse(
        @NotNull Double distanceKilometers,
        @NotNull OffsetDateTime start,
        @NotNull OffsetDateTime end
) {}
