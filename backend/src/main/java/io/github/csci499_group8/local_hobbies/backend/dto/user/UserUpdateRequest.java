package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.LocalDate;

/**
 * Request to change user information; contains only fields that are being updated
 */
public record UserUpdateRequest(
    @NotNullIfPresent JsonNullable<String> email,
    @NotNullIfPresent JsonNullable<String> name,
    @NotNullIfPresent JsonNullable<LocalDate> birthDate,
    JsonNullable<String> genderDisplayed, //nullable
    JsonNullable<String> bio, //nullable
    @NotNullIfPresent @Valid JsonNullable<GeoJsonPoint> location,
    @NotNullIfPresent JsonNullable<String> publicContactInfo,
    JsonNullable<String> profilePhotoKey, //nullable
    @NotNullIfPresent JsonNullable<UserGenderMatched> genderMatched,
    @NotNullIfPresent JsonNullable<Boolean> showAge,
    @NotNullIfPresent JsonNullable<Boolean> showGenderDisplayed
) {}
