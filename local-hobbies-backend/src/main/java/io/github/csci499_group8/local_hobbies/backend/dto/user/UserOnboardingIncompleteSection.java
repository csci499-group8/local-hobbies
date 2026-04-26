package io.github.csci499_group8.local_hobbies.backend.dto.user;

import jakarta.validation.constraints.NotNull;

/**
 * Section of a user's account information that is required and incomplete
 */
public record UserOnboardingIncompleteSection(
    @NotNull SectionName name,
    @NotNull IncompleteReason reason
) {
    public enum SectionName {
        name,
        birthDate,
        location,
        publicContactInfo,
        genderMatched,
        showAge,
        showGenderDisplayed,
        hobbies,
        availabilities
    }

    public enum IncompleteReason {
        NO_VALUE,
        MIN_COUNT_NOT_MET
    }
}
