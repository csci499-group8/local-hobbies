package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import jakarta.validation.constraints.NotNull;

public record HobbyUpdateRequest(
    @NotNull HobbyExperienceLevel experienceLevel
) {}
