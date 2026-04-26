package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UserResponse(
    @NotNull Integer id,
    @NotBlank String username,
    @NotBlank String email,
    @NotBlank String name,
    @NotNull LocalDate birthDate,
    String genderDisplayed, //nullable
    String bio, //nullable
    @Valid @NotNull GeoJsonPoint locationPoint,
    @NotBlank String locationApproximate,
    @NotBlank String publicContactInfo,
    String profilePhotoUrl, //nullable
    @NotNull UserGenderMatched genderMatched,
    @NotNull boolean showAge,
    @NotNull boolean showGenderDisplayed
) {}
