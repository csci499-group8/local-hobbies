package io.github.csci499_group8.local_hobbies.backend.dto.auth;

import jakarta.validation.constraints.NotNull;

public record AuthRefreshRequest(
    @NotNull String refreshToken
) {}
