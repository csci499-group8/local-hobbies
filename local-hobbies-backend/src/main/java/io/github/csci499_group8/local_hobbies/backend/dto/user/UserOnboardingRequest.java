package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOnboardingRequests;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyCreationRequest;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

/**
 * Request to complete onboarding; contains only fields that are being updated
 */
public record UserOnboardingRequest(
    String name,
    LocalDate birthDate,
    @Valid GeoJsonPoint location,
    String publicContactInfo,
    UserGenderMatched genderMatched,
    @Valid List<HobbyCreationRequest> hobbies,
    @Valid AvailabilityOnboardingRequests availabilities
) {}