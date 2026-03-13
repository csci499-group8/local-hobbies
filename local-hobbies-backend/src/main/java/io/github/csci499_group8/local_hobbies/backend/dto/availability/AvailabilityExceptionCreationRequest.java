package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

public record AvailabilityExceptionCreationRequest(
    @NotNull Integer recurringAvailabilityId,
    @NotNull LocalDate exceptionDate,
    @NotNull String exceptionReason,
    @NotNull boolean isCancelled,
    GeoJsonPoint overrideLocation, //omitted if isCancelled = true
    LocalTime overrideStartTime, //omitted if isCancelled = true
    Duration overrideDuration //omitted if isCancelled = true
) {}
