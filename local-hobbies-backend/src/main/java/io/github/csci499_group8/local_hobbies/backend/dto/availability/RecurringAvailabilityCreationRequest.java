package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

public record RecurringAvailabilityCreationRequest(
    @NotNull GeoJsonPoint location,
    @NotNull LocalDate ruleStart,
    LocalDate ruleEnd, //omitted if rule continues indefinitely
    @NotNull Frequency frequency,
    @Min(0) @Max(6) Integer startDayOfWeek, //0=Sunday, 6=Saturday; omitted if startDayOfMonth is submitted
    @Min(1) @Max(31) Integer startDayOfMonth, //omitted if startDayOfWeek is submitted
    @NotNull LocalTime startTime,
    @NotNull Duration duration
) {}
