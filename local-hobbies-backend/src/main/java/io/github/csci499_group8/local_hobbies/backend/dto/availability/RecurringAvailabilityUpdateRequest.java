package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.WithinDays;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityFrequency;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;

/**
 * Contains only fields that are being updated
 */
public record RecurringAvailabilityUpdateRequest(
    @NotNullIfPresent @Valid JsonNullable<GeoJsonPoint> location,
    @NotNullIfPresent @WithinDays(SCHEDULING_WINDOW_DAYS) JsonNullable<LocalDate> ruleStart,
    JsonNullable<LocalDate> ruleEnd, //null if rule continues indefinitely
    @NotNullIfPresent JsonNullable<AvailabilityFrequency> frequency,
    JsonNullable<DayOfWeek> startDayOfWeek, //null if startDayOfMonth is submitted and not null
    @Min(1) @Max(31) JsonNullable<Integer> startDayOfMonth, //null if startDayOfWeek is submitted and not null
    @NotNullIfPresent JsonNullable<LocalTime> startTime,
    @NotNullIfPresent @MaxDurationHours(MAX_DURATION_HOURS) JsonNullable<Duration> duration
) {
    @AssertTrue(message = "Rule end date must be after rule start date")
    private boolean isEndAfterStart() {
        //if JsonNullable objects were not created or if they are empty (not included in the request)
        if (ruleStart == null || !ruleStart.isPresent()
            || ruleEnd == null || !ruleEnd.isPresent()) {
            //validate update in service layer
            return true;
        }

        if (ruleStart.get() == null //if start is null (which @NotNullIfPresent will catch)
            || ruleEnd.get() == null) { //if rule continues indefinitely
            return true;
        }

        return !ruleEnd.get().isBefore(ruleStart.get());
    }
}
