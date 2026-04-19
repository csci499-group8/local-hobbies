package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import org.locationtech.jts.geom.Point;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class AvailabilityException implements UserOwned {

    public Integer getUserId() {
        return null;
    }

    public Integer getRecurringAvailabilityId() {
        return null;
    }

    public LocalDate getExceptionDate() {
        return null;
    }

    public boolean getIsCancelled() {
        return false;
    }

    public @NotNull Integer getId() {
    }

    public @NotNull Point getOverrideLocation() {
    }

    public @NotNull LocalTime getOverrideStartTime() {
    }

    public @NotNull Duration getOverrideDuration() {
    }
}
