package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import jakarta.validation.constraints.NotBlank;

public record HobbyOverlapResponse(
    @NotBlank String name
) {}
