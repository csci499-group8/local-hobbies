package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum UserGenderMatched {
    @JsonProperty("Man") MAN,
    @JsonProperty("Nonbinary") NONBINARY,
    @JsonProperty("Woman") WOMAN
}
