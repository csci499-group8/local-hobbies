package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.Entity;
import org.locationtech.jts.geom.Point;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAmount;

@Entity
public class OneTimeAvailability implements UserOwned {

    public Integer getUserId() {
        return null;
    }

    Integer getId() {

    }

    Point getLocation() {

    }

    public OffsetDateTime getStart() {
    }

    public Duration getDuration() {
        return null;
    }
}
