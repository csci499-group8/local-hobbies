package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Contains only fields that are being updated
 */
public record OneTimeAvailabilityUpdateRequest(
    GeoJsonPoint location,
    LocalDate startDate,
    LocalTime startTime,
    Duration duration
) {}
