package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record OtherUserProfileResponse (
    @NotNull UUID id,
    @NotBlank String name,
    Integer age, //null if showAge is false
    String genderDisplayed, //null if not set or if showGenderDisplayed is false
    String bio, //nullable
    @NotBlank String locationApproximate,
    @NotBlank String publicContactInfo,
    String profilePhotoUrl, //nullable
    @Valid @NotEmpty List<HobbyResponse> hobbies,
    @Valid @NotNull List<HobbyPhotoResponse> hobbyPhotos, //may be empty
    @NotNull boolean isSavedMatch,
    @Valid @NotNull List<HobbyOverlapResponse> overlappingHobbies, //may be empty
    @Valid @NotNull List<AvailabilityOverlapResponse> overlappingAvailabilities //may be empty
) {}
