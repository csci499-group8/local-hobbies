package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

/**
 * Contains only fields that are being updated
 */
public record AvailabilityExceptionUpdateRequest(
        Integer recurringAvailabilityId,
        @WithinDays(SCHEDULING_WINDOW_DAYS) LocalDate exceptionDate,
        String exceptionReason,
        Boolean isCancelled,
        @Valid GeoJsonPoint overrideLocation, //null if isCancelled = true
        LocalTime overrideStartTime, //null if isCancelled = true
        @MaxDurationHours(MAX_DURATION_HOURS) Duration overrideDuration //null if isCancelled = true
) {}
