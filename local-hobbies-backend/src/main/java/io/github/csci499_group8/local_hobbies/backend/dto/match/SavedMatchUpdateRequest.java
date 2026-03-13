package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotBlank;

public record SavedMatchUpdateRequest(
    @NotBlank String notes
) {}
