package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HobbyCreationRequest(
    @NotBlank String name,
    @NotNull HobbyExperienceLevel experienceLevel
) {}
