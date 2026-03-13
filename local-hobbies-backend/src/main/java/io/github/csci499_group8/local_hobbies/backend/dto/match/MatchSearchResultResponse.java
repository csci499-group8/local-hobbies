package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MatchSearchResultResponse(
    @NotNull MatchedUser matchedUser,
    @NotBlank String hobby,
    @NotNull Double distanceKilometers,
    @NotNull List<AvailabilityOverlapResponse> overlappingAvailabilities
) {}
