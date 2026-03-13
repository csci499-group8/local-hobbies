package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AvailabilityCreationListRequest(
    @NotNull List<OneTimeAvailabilityCreationRequest> oneTime,
    @NotNull List<RecurringAvailabilityCreationRequest> recurring,
    @NotNull List<AvailabilityExceptionCreationRequest> exceptions
) {}