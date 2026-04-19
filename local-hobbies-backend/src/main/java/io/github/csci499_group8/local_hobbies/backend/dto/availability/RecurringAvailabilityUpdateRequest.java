package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

/**
 * Contains only fields that are being updated
 */
public record RecurringAvailabilityUpdateRequest(
    @Valid GeoJsonPoint location,
    @WithinDays(SCHEDULING_WINDOW_DAYS) LocalDate ruleStart,
    LocalDate ruleEnd, //null if rule continues indefinitely
    AvailabilityFrequency frequency,
    @Min(1) @Max(7) Integer startDayOfWeek, //1=Monday, 7=Sunday; null if startDayOfMonth is not null
    @Min(1) @Max(31) Integer startDayOfMonth, //null if startDayOfWeek is not null
    LocalTime startTime,
    @MaxDurationHours(MAX_DURATION_HOURS) Duration duration
) {
    @AssertTrue(message = "Rule end date must be after rule start date")
    private boolean isEndAfterStart() {
        //if update does not include both values, validate in service layer instead
        if (ruleStart == null || ruleEnd == null) {
            return true;
        }

        return !ruleEnd.isBefore(ruleStart);
    }
}
