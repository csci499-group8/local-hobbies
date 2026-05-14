package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AvailabilityFrequency {
    WEEKLY("Weekly"),
    EVERY_TWO_WEEKS("Every two weeks"),
    MONTHLY("Monthly");

    @JsonValue
    private final String label;

}
