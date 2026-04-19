package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

/**
 * Request to update hobby photo information; contains only fields that are being updated
 */
public record HobbyPhotoUpdateRequest(
    Integer hobbyId,
    String caption //may be omitted
) {}
