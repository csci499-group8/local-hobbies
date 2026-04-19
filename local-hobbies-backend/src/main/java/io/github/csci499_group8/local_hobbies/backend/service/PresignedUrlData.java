package io.github.csci499_group8.local_hobbies.backend.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record PresignedUrlData(
    @NotBlank String url,
    @NotNull OffsetDateTime expirationTime
) {}
