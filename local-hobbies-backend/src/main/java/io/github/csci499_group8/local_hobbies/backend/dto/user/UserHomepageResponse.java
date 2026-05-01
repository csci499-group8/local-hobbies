package io.github.csci499_group8.local_hobbies.backend.dto.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserHomepageResponse (
    @Valid @NotNull UserHomepageResponse.UserSummary user,
    @Valid @NotNull HobbySummary hobbySummary,
    @Valid @NotNull AvailabilitySummary availabilitySummary,
    @Valid @NotNull MatchSummary matchSummary
) {
    /**
     * Minimal user info for homepage display
     */
    public record UserSummary(
        @NotBlank String name,
        String profilePhotoUrl //nullable
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
        @NotNull Integer inboundMatchCount
    ) {}
}
