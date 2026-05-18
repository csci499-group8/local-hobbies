package io.github.csci499_group8.local_hobbies.backend.dto.common;

import jakarta.validation.constraints.NotBlank;

/**
 * Request for presigned URL to upload file to cloud storage
 */
public record UploadUrlRequest(
    @NotBlank String fileName,
    @NotBlank String contentType
) {}
