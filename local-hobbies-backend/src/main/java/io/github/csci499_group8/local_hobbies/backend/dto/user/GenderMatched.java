package io.github.csci499_group8.local_hobbies.backend.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum GenderMatched {
    @JsonProperty("Man") MAN,
    @JsonProperty("Nonbinary") NONBINARY,
    @JsonProperty("Woman") WOMAN
}
