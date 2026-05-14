package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOnboardingRequests;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyCreationRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.LocalDate;
import java.util.List;

/**
 * Request to complete onboarding; contains only fields that are being updated
 */
public record UserOnboardingRequest(
    @NotNullIfPresent JsonNullable<String> name,
    @NotNullIfPresent JsonNullable<LocalDate> birthDate,
    @NotNullIfPresent @Valid JsonNullable<GeoJsonPoint> location,
    @NotNullIfPresent JsonNullable<String> publicContactInfo,
    @NotNullIfPresent JsonNullable<UserGenderMatched> genderMatched,
    @NotNullIfPresent JsonNullable<Boolean> showAge,
    @NotNullIfPresent JsonNullable<Boolean> showGenderDisplayed,
    @NotNullIfPresent @Valid JsonNullable<List<HobbyCreationRequest>> hobbies,
    @NotNullIfPresent @Valid JsonNullable<AvailabilityOnboardingRequests> availabilities
) {}
