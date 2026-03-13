package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Contains only fields that are being updated
 */
public record RecurringAvailabilityUpdateRequest(
    GeoJsonPoint location,
    LocalDate ruleStart,
    LocalDate ruleEnd, //null if rule continues indefinitely
    Frequency frequency,
    @Min(0) @Max(6) Integer startDayOfWeek, //0=Sunday, 6=Saturday; null if startDayOfMonth is not null
    @Min(1) @Max(31) Integer startDayOfMonth, //null if startDayOfWeek is not null
    LocalTime startTime,
    Duration duration
) {}
