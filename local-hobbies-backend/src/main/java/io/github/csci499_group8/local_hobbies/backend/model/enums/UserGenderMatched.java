package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserGenderMatched {
    MAN("Man"),
    NONBINARY("Nonbinary"),
    WOMAN("Woman");

    @JsonValue
    private final String label;

}
