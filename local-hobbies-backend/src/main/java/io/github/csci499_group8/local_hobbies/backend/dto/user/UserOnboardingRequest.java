package io.github.csci499_group8.local_hobbies.backend.dto.user;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityCreationListRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyCreationRequest;

import java.time.LocalDate;
import java.util.List;

/**
 * Request to complete onboarding; contains only fields that are being updated
 */
public record UserOnboardingRequest(
    String name,
    LocalDate birthDate,
    GeoJsonPoint location,
    String publicContactInfo,
    GenderMatched genderMatched,
    List<HobbyCreationRequest> hobbies,
    AvailabilityCreationListRequest availabilities
) {}