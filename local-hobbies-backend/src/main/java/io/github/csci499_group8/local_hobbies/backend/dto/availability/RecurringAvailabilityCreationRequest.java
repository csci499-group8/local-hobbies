package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

public record RecurringAvailabilityCreationRequest(
    @Valid @NotNull GeoJsonPoint location,
    @NotNull @WithinDays(SCHEDULING_WINDOW_DAYS) LocalDate ruleStart,
    LocalDate ruleEnd, //omitted if rule continues indefinitely
    @NotNull AvailabilityFrequency frequency,
    @Min(1) @Max(7) Integer startDayOfWeek, //1=Monday, 7=Sunday; omitted if startDayOfMonth is submitted
    @Min(1) @Max(31) Integer startDayOfMonth, //omitted if startDayOfWeek is submitted
    @NotNull LocalTime startTime,
    @NotNull @MaxDurationHours(MAX_DURATION_HOURS) Duration duration,
    @NotBlank String timeZoneId
) {
    @AssertTrue(message = "Rule end date must be after rule start date")
    private boolean isEndAfterStart() {
        if (ruleEnd == null) return true; //valid value (rule continues indefinitely)

        return !ruleEnd.isBefore(ruleStart);
    }
}
