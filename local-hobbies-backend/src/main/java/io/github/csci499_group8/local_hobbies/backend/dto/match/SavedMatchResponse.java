package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record SavedMatchResponse(
    @NotNull Integer id,
    @NotNull Integer userId,
    @NotNull MatchedUser savedUser,
    @NotBlank String hobby,
    String notes, //nullable
    @NotNull OffsetDateTime creationTime
) {}
