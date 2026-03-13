package io.github.csci499_group8.local_hobbies.backend.dto.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SavedMatchRestorationRequest(
    @NotNull Integer savedUserId,
    @NotBlank String hobby
) {}
