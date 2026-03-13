package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OtherUserProfileResponse (
    @NotBlank Integer id,
    @NotBlank String name,
    @NotNull Integer age,
    String genderDisplayed,
    String bio,
    @NotBlank String locationApproximate,
    @NotBlank String publicContactInfo,
    String profilePhotoUrl,
    @NotNull List<HobbyResponse> hobbies,
    @NotNull List<HobbyPhotoResponse> hobbyPhotos,
    @NotNull boolean isSavedMatch,
    @NotNull List<HobbyOverlapResponse> overlappingHobbies,
    @NotNull List<AvailabilityOverlapResponse> overlappingAvailabilities
) {}
