package io.github.csci499_group8.local_hobbies.backend.dto.common;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GeoJsonPoint(
    @NotNull GeometryType geometryType,

    @NotEmpty @Size(min = 2, max = 2, message = "Coordinates must contain exactly [longitude, latitude]")
    List<Double> coordinates
) {
    public enum GeometryType { Point }
}
