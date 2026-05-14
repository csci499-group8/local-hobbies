package io.github.csci499_group8.local_hobbies.backend.dto.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response for successful signup, login, and onboarding
 */
public record AuthResponse(
    @Valid @NotNull Auth auth,
    @Valid @NotNull AuthResponse.User user
) {
    /**
     * Token and session security details
     */
    public record Auth(
        @NotBlank String accessToken,
        @NotBlank String tokenType, //e.g. "Bearer"
        @NotNull OffsetDateTime expirationTime,
        @NotBlank String refreshToken
    ) {}

    /**
     * Minimal user info for routing/state management
     */
    public record User(
        @NotNull UUID id,
        @NotNull boolean onboardingComplete
    ) {}
}
