package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

public record AvailabilityExceptionCreationRequest(
    @NotNull Integer recurringAvailabilityId,
    @NotNull @WithinDays LocalDate exceptionDate,
    String exceptionReason, //may be omitted or null
    @NotNull boolean isCancelled,
    @Valid GeoJsonPoint overrideLocation, //omitted or null if isCancelled = true
    LocalTime overrideStartTime, //omitted or null if isCancelled = true
    @MaxDurationHours Duration overrideDuration //omitted or null if isCancelled = true
) {}
