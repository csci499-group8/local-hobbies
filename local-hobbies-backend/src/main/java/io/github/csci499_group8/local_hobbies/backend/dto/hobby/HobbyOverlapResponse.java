package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.constraints.NotNull;

public record HobbyOverlapResponse(
    @NotNull HobbyName name
) {}
