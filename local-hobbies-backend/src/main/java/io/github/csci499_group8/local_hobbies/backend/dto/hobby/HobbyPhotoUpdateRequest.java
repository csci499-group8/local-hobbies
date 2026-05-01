package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import org.openapitools.jackson.nullable.JsonNullable;

import java.util.UUID;

/**
 * Request to update hobby photo information; contains only fields that are being updated
 */
public record HobbyPhotoUpdateRequest(
    @NotNullIfPresent JsonNullable<UUID> hobbyId,
    JsonNullable<String> caption //nullable
) {}
