package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

public record RecurringAvailabilityResponse (
    @NotNull Integer id,
    @NotNull Integer userId,
    @Valid @NotNull GeoJsonPoint location,
    @NotNull LocalDate ruleStart,
    LocalDate ruleEnd, //null if rule continues indefinitely
    @NotNull AvailabilityFrequency frequency,
    @Min(1) @Max(7) Integer startDayOfWeek, //1=Monday, 7=Sunday; null if startDayOfMonth is not null
    @Min(1) @Max(31) Integer startDayOfMonth, //null if startDayOfWeek is not null
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {}
