package io.github.csci499_group8.local_hobbies.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthSignupRequest(
    @NotBlank @Size(min = 3, max = 40) String username,
    @NotBlank @Size(min = 8) String password,
    @NotBlank @Email String email
) {}