package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MatchedUser (
    @NotNull UUID id,
    @NotBlank String name,
    String profilePhotoUrl, //nullable
    @NotNull OffsetDateTime lastSessionTime
) {}
