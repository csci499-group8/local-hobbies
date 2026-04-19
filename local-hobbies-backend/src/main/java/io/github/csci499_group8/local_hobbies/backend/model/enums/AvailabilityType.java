package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AvailabilityType {
    @JsonProperty("One-time") ONE_TIME,
    @JsonProperty("Recurring") RECURRING,
    @JsonProperty("Exception") EXCEPTION
}