package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import jakarta.validation.Valid;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.Duration;
import java.time.LocalTime;

/**
 * Contains only fields that are being updated
 */
public record AvailabilityExceptionUpdateRequest(
    JsonNullable<String> exceptionReason, //nullable
    @NotNullIfPresent JsonNullable<Boolean> isCancelled,
    @Valid JsonNullable<GeoJsonPoint> overrideLocation, //null if isCancelled = true
    JsonNullable<LocalTime> overrideStartTime, //null if isCancelled = true
    @MaxDurationHours JsonNullable<Duration> overrideDuration //null if isCancelled = true
) {}
