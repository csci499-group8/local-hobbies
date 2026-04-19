package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyCategory;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HobbyResponse(
    @NotNull Integer id,
    @NotBlank String name,
    @NotBlank HobbyCategory category,
    @NotNull HobbyExperienceLevel experienceLevel
) {}
