package io.github.csci499_group8.local_hobbies.backend.dto.availability;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AvailabilityFrequency {
    @JsonProperty("Weekly") WEEKLY,
    @JsonProperty("Every two weeks") EVERY_TWO_WEEKS,
    @JsonProperty("Monthly") MONTHLY
}