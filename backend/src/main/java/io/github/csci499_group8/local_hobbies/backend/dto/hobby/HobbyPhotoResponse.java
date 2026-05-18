package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record HobbyPhotoResponse(
    @NotNull UUID id,
    @NotNull UUID hobbyId,
    @NotNull HobbyName hobbyName,
    @NotBlank String photoUrl,
    String caption //nullable
) {}
