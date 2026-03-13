package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import jakarta.validation.constraints.NotBlank;

public record HobbyPhotoCreationRequest(
    @NotBlank String hobby,
    @NotBlank String photoUrl,
    String caption //may be omitted
) {}
