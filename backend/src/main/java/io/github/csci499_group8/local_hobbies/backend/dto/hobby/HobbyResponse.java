package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyCategory;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record HobbyResponse(
    @NotNull UUID id,
    @NotNull HobbyName name,
    @NotNull HobbyCategory category,
    @NotNull HobbyExperienceLevel experienceLevel
) {}
