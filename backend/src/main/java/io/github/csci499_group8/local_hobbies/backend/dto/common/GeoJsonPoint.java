package io.github.csci499_group8.local_hobbies.backend.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeoJsonPoint(
    @NotEmpty @Size(min = 2, max = 2, message = "Coordinates must contain exactly [longitude, latitude]")
    List<Double> coordinates
) {
    @JsonProperty("geometryType")
    public String geometryType() {
        return "Point";
    }
}
