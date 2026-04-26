package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HobbyPhotoResponse(
    @NotNull Integer id,
    @NotNull Integer hobbyId,
    @NotBlank String photoUrl,
    String caption //nullable
) {}
