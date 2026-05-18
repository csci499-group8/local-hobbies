package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CurrentUserProfileResponse (
    @NotBlank String name,
    Integer age, //null if showAge is false
    String genderDisplayed, //null if not set or if showGenderDisplayed is false
    String bio, //nullable
    @NotBlank String locationApproximate,
    @NotBlank String contactInfo,
    String profilePhotoUrl, //nullable
    @Valid @NotNull List<HobbyResponse> hobbies, //may be empty (but user won't show up in searches)
    @Valid @NotNull List<HobbyPhotoResponse> hobbyPhotos //may be empty
) {}
