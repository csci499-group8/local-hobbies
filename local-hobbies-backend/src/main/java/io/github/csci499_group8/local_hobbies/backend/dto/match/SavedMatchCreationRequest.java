package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SavedMatchCreationRequest(
    @NotNull UUID savedUserId,
    String notes //may be omitted or null
) {}
