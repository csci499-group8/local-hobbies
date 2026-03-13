package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UserResponse(
    @NotNull Integer id,
    @NotBlank String username,
    @NotBlank String email,
    @NotBlank String name,
    @NotNull LocalDate birthDate,
    String genderDisplayed,
    String bio,
    @NotNull GeoJsonPoint location,
    @NotBlank String publicContactInfo,
    String profilePhotoUrl,
    @NotNull GenderMatched genderMatched,
    @NotNull boolean showAge,
    @NotNull boolean showGenderDisplayed
) {}