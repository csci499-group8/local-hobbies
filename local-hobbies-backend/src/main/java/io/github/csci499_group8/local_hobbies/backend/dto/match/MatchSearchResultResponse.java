package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchDistanceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MatchSearchResultResponse(
    @Valid @NotNull MatchedUser matchedUser,
    @NotNull MatchDistanceType distanceType,
    @NotNull Double distanceKilometers,
    @Valid @NotEmpty List<AvailabilityOverlapResponse> overlappingAvailabilities
) {}
