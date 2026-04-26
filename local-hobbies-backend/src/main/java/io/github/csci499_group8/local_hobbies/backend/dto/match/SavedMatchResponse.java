package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record SavedMatchResponse(
    @NotNull Integer id,
    @NotNull Integer userId,
    @Valid @NotNull MatchedUser savedUser,
    @NotNull HobbyName hobby,
    String notes, //nullable
    @NotNull OffsetDateTime creationTime
) {}
