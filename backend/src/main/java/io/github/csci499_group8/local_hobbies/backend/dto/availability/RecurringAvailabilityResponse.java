package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityFrequency;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record RecurringAvailabilityResponse (
    @NotNull UUID id,
    @Valid @NotNull GeoJsonPoint location,
    @NotNull LocalDate ruleStart,
    LocalDate ruleEnd, //null if rule continues indefinitely
    @NotNull AvailabilityFrequency frequency,
    DayOfWeek startDayOfWeek, //null if startDayOfMonth is not null
    @Min(1) @Max(31) Integer startDayOfMonth, //null if startDayOfWeek is not null
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {}
