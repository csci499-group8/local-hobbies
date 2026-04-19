package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum HobbyExperienceLevel {
    @JsonProperty("Beginner") BEGINNER,
    @JsonProperty("Intermediate") INTERMEDIATE,
    @JsonProperty("Advanced") ADVANCED
}
