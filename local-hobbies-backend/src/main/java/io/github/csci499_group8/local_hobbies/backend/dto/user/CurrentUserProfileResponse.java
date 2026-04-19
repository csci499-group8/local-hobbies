package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CurrentUserProfileResponse (
    @NotBlank String name,
    @NotNull Integer age,
    String genderDisplayed,
    String bio,
    @NotBlank String locationApproximate,
    @NotBlank String publicContactInfo,
    String profilePhotoUrl,
    @Valid @NotNull List<HobbyResponse> hobbies,
    @Valid @NotNull List<HobbyPhotoResponse> hobbyPhotos
) {}
