package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MatchSearchResultResponse(
    @Valid @NotNull MatchedUser matchedUser,
//    @NotBlank String hobby, //TODO: omit from yaml
    @NotNull Double distanceKilometers,
    @Valid @NotNull List<AvailabilityOverlapResponse> overlappingAvailabilities
) {}
