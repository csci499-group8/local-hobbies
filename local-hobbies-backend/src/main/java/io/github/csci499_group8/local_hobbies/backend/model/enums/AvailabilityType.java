package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AvailabilityType {
    ONE_TIME("One-time"),
    RECURRING("Recurring"),
    EXCEPTION("Exception");

    @JsonValue
    private final String label;

}
