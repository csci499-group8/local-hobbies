package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import jakarta.validation.constraints.NotNull;

public record HobbyUpdateRequest(
    @NotNull HobbyExperienceLevel experienceLevel
) {}
