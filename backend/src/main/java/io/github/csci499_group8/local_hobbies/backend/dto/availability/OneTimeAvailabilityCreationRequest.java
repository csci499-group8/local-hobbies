package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

public record OneTimeAvailabilityCreationRequest(
    @Valid @NotNull GeoJsonPoint location,
    @NotNull @WithinDays LocalDate date,
    @NotNull LocalTime startTime,
    @NotNull @MaxDurationHours Duration duration
) {}
