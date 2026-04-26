package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.constraints.NotNull;

public record SavedMatchCreationRequest(
    @NotNull Integer savedUserId,
    @NotNull HobbyName hobby,
    String notes //may be omitted or null
) {}
