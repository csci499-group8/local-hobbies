package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Category of the calculated shortest distance between the users; "Home" indicates
 * the shortest distance is between the users' default locations; "Nearest
 * overlapping availability" indicates the distance is between the users'
 * geographically closest overlapping availabilities
 */
@Getter
@RequiredArgsConstructor
public enum MatchDistanceType {
    HOME("Home"),
    NEAREST_OVERLAPPING_AVAILABILITY("Nearest overlapping availability");

    @JsonValue
    private final String label;

}
