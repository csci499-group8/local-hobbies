package io.github.csci499_group8.local_hobbies.backend.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record GlobalError(
    @NotBlank String errorCode,
    @NotBlank String errorMessage,
    @NotNull OffsetDateTime timestamp,
    @NotBlank String endpointURI
) {}
