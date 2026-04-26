package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

/**
 * Request used during onboarding; omits recurringAvailabilityId, instead relying
 * on JSON nesting to associate with recurring availability
 */
public record AvailabilityExceptionOnboardingCreationRequest (
    @NotNull @WithinDays(SCHEDULING_WINDOW_DAYS) LocalDate exceptionDate,
    @NotNull String exceptionReason,
    @NotNull boolean isCancelled,
    @Valid GeoJsonPoint overrideLocation, //omitted or null if isCancelled = true
    LocalTime overrideStartTime, //omitted or null if isCancelled = true
    @MaxDurationHours(MAX_DURATION_HOURS) Duration overrideDuration //omitted or null if isCancelled = true
) {}
