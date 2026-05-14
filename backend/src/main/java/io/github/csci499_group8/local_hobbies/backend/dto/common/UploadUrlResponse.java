package io.github.csci499_group8.local_hobbies.backend.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record UploadUrlResponse(
        @NotBlank String fileKey,
        @NotBlank String uploadUrl,
        @NotNull OffsetDateTime expirationTime
) {}
