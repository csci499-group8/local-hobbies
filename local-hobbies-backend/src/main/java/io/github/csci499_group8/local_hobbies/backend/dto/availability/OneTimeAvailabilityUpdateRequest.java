package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import jakarta.validation.Valid;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.Duration;
import java.time.OffsetDateTime;

/**
 * Contains only fields that are being updated
 */
public record OneTimeAvailabilityUpdateRequest(
    @NotNullIfPresent @Valid JsonNullable<GeoJsonPoint> location,
    @NotNullIfPresent @WithinDays JsonNullable<OffsetDateTime> start,
    @NotNullIfPresent @MaxDurationHours JsonNullable<Duration> duration
) {}
