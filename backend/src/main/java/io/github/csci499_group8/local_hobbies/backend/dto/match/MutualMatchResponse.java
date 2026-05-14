package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record MutualMatchResponse(
    @NotNull UUID currentUserMatchId,
    @Valid @NotNull MatchedUser savedUser,
    @NotNull List<HobbyOverlapResponse> overlappingHobbies,
    String notes, //nullable
    @NotNull OffsetDateTime mutualMatchTime
) {}
