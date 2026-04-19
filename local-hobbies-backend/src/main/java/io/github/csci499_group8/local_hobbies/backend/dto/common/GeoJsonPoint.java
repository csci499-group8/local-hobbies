package io.github.csci499_group8.local_hobbies.backend.dto.common;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GeoJsonPoint(
    @NotNull GeometryType pointType,

    @NotNull
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly [longitude, latitude]")
    List<Double> coordinates
) {
    public enum GeometryType { Point }

    //helper methods for clarity in service layer
    public Double getLongitude() { return coordinates.get(0); }
    public Double getLatitude() { return coordinates.get(1); }
}
