package io.github.csci499_group8.local_hobbies.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

/**
 * Response for successful signup, login, and onboarding
 */
public record AuthResponse(
    @NotNull Auth auth,
    @NotNull AuthResponse.User user
) {
    /**
     * Token and session security details
     */
    public record Auth(
        @NotBlank String accessToken,
        @NotBlank String tokenType, // Example: "Bearer"
        @NotNull OffsetDateTime expirationTime,
        @NotBlank String refreshToken
    ) {}

    /**
     * Minimal user info for routing/state management
     */
    public record User(
        @NotNull Integer id,
        @NotNull boolean onboardingComplete
    ) {}
}