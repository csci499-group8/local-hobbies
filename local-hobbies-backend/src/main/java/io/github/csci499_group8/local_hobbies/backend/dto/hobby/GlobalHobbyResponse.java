package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyCategory;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.constraints.NotNull;

public record GlobalHobbyResponse(
    @NotNull HobbyName name,
    @NotNull HobbyCategory category
) {}
