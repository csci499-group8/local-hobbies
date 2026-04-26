package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import org.openapitools.jackson.nullable.JsonNullable;

/**
 * Request to update hobby photo information; contains only fields that are being updated
 */
public record HobbyPhotoUpdateRequest(
    @NotNullIfPresent JsonNullable<Integer> hobbyId,
    JsonNullable<String> caption //nullable
) {}
