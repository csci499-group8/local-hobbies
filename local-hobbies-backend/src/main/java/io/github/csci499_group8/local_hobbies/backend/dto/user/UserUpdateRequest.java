package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;

import java.time.LocalDate;

/**
 * Request to change user information; contains only fields that are being updated
 */
public record UserUpdateRequest(
    String email,
    String name,
    LocalDate birthDate,
    String genderDisplayed,
    String bio,
    GeoJsonPoint location,
    String publicContactInfo,
    String profilePhotoUrl,
    GenderMatched genderMatched,
    boolean showAge,
    boolean showGenderDisplayed
) {}