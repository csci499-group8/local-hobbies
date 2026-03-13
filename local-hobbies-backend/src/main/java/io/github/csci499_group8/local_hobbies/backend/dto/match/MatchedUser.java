package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record MatchedUser (
    @NotNull Integer id,
    @NotBlank String name,
    String profilePhotoUrl, //nullable
    @NotNull OffsetDateTime lastSessionTime
) {}
