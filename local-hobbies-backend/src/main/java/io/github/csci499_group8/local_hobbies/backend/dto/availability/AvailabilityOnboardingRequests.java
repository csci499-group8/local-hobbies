package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Availability creation requests submitted during onboarding
 * @param oneTimes list of OneTimeAvailability creation requests
 * @param recurringsWithExceptions nested list containing RecurringAvailability
 *                                 creation requests and their associated
 *                                 AvailabilityException creation requests
 */
public record AvailabilityOnboardingRequests(
    @Valid @NotNull List<OneTimeAvailabilityCreationRequest> oneTimes, //may be empty
    @Valid @NotNull List<RecurringAvailabilityWithExceptions> recurringsWithExceptions //may be empty
) {
    public record RecurringAvailabilityWithExceptions(
        @Valid @NotNull RecurringAvailabilityCreationRequest recurring,
        @Valid @NotNull List<AvailabilityExceptionOnboardingCreationRequest> exceptions //may be empty
    ) {}
}
