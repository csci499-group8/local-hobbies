package io.github.csci499_group8.local_hobbies.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
    @NotBlank String username,
    @NotBlank String password
) {}