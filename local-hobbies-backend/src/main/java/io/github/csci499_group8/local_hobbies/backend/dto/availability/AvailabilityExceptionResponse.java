package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

public record AvailabilityExceptionResponse(
        @NotNull Integer id,
        @NotNull Integer userId,
        @NotNull Integer recurringAvailabilityId,
        @NotNull LocalDate exceptionDate,
        @NotNull String exceptionReason,
        @NotNull boolean isCancelled,
        @Valid GeoJsonPoint overrideLocation, //null if isCancelled = true
        LocalTime overrideStartTime, //null if isCancelled = true
        Duration overrideDuration //null if isCancelled = true
) {}
