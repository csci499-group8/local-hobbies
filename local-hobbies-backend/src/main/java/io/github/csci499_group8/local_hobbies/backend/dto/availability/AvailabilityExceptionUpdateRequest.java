package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import jakarta.validation.Valid;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

/**
 * Contains only fields that are being updated
 */
public record AvailabilityExceptionUpdateRequest(
    @NotNullIfPresent JsonNullable<Integer> recurringAvailabilityId,
    @NotNullIfPresent @WithinDays(SCHEDULING_WINDOW_DAYS) JsonNullable<LocalDate> exceptionDate,
    @NotNullIfPresent JsonNullable<String> exceptionReason, //TODO: change to @NotBlankIfPresent? or maybe can be blank?
    @NotNullIfPresent JsonNullable<Boolean> isCancelled,
    @Valid JsonNullable<GeoJsonPoint> overrideLocation, //null if isCancelled = true
    JsonNullable<LocalTime> overrideStartTime, //null if isCancelled = true
    @MaxDurationHours(MAX_DURATION_HOURS) JsonNullable<Duration> overrideDuration //null if isCancelled = true
) {}
