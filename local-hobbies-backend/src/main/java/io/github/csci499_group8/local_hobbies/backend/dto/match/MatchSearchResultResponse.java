package io.github.csci499_group8.local_hobbies.backend.dto.match;

import com.fasterxml.jackson.annotation.JsonValue;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MatchSearchResultResponse(
    @Valid @NotNull MatchedUser matchedUser,
    @NotNull MatchSearchResultResponse.MatchDistanceType distanceType,
    @NotNull Double distanceKilometers,
    @Valid @NotEmpty List<AvailabilityOverlapResponse> overlappingAvailabilities
) {
    /**
     * Category of the calculated shortest distance between the users; "Home" indicates
     * the shortest distance is between the users' default locations; "Nearest
     * overlapping availability" indicates the distance is between the users'
     * geographically closest overlapping availabilities
     */
    public enum MatchDistanceType {
        HOME("Home"),
        NEAREST_OVERLAPPING_AVAILABILITY("Nearest overlapping availability");

        private final String label;

        MatchDistanceType(String label) {
            this.label = label;
        }

        @JsonValue
        public String getLabel() {
            return label;
        }

    }
}
