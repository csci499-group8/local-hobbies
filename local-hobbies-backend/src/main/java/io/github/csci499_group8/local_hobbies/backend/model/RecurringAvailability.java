package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityFrequency;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import org.locationtech.jts.geom.Point;

import java.time.*;
import java.time.temporal.TemporalAmount;

@Entity
public class RecurringAvailability implements UserOwned {

    public Integer getUserId() {
        return null;
    }

    public AvailabilityFrequency getFrequency() {
        return null;
    }

    @Enumerated(EnumType.STRING)
    public DayOfWeek getStartDayOfWeek() {
    }

    public int getStartDayOfMonth() {
    }

    public LocalDate getRuleStart() {
    }

    public LocalDate getRuleEnd() {
        return null;
    }

    public LocalTime getStartTime() {
    }

    public ZoneId getZoneId() {
        return null;
    }

    public Duration getDuration() {
    }

    public Integer getId() {
    }

    public @NotNull Point getLocation() {
        return null;
    }
}
