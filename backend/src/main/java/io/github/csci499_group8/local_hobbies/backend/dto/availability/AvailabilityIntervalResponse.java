package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityType;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvailabilityIntervalResponse(
    @NotNull AvailabilityType sourceType,
    @NotNull UUID sourceId,
    @NotNull GeoJsonPoint location,
    @NotNull OffsetDateTime start,
    @NotNull OffsetDateTime end
) {}
