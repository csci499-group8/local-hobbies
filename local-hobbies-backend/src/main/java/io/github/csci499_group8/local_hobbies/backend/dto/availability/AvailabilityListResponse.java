package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AvailabilityListResponse(
    @NotNull List<OneTimeAvailabilityResponse> oneTime,
    @NotNull List<RecurringAvailabilityResponse> recurring,
    @NotNull List<AvailabilityExceptionResponse> exceptions
) {}
