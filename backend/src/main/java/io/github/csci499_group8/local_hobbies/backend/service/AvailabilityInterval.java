package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityType;
import jakarta.validation.constraints.NotNull;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvailabilityInterval(
    @NotNull AvailabilityType sourceType,
    @NotNull UUID sourceId,
    @NotNull Point location,
    @NotNull OffsetDateTime start,
    @NotNull OffsetDateTime end
) {
    public boolean overlaps(AvailabilityInterval other) {
        return this.start.isBefore(other.end) && this.end().isAfter(other.start);
    }
}
