package io.github.csci499_group8.local_hobbies.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserHomepageResponse (
    @NotNull UserHomepageResponse.UserSummary user,
    @NotNull HobbySummary hobbySummary,
    @NotNull AvailabilitySummary availabilitySummary,
    @NotNull MatchSummary matchSummary
) {
    /**
     * Minimal user info for homepage display
     */
    public record UserSummary(
        @NotNull Integer id,
        @NotBlank String name,
        String profilePhotoUrl
    ) {}

    /**
     * Number of hobbies user has
     */
    public record HobbySummary(
        @NotNull Integer count
    ) {}

    /**
     * Next meetup user has booked
     */
    public record AvailabilitySummary(
//        @NotNull nextBookedMeetup
        //TODO: implement meetup bookings
    ) {}

    /**
     * Number of matches user has
     */
    public record MatchSummary(
        @NotNull Integer count
    ) {}
}
