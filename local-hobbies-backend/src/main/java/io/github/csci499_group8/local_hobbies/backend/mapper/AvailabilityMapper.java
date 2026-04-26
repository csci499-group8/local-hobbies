package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityType;
import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityInterval;
import org.locationtech.jts.geom.Point;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.*;

@Mapper(componentModel = "spring",
        imports = {AvailabilityType.class},
        uses = { JsonNullableMapper.class, LocationMapper.class })
public abstract class AvailabilityMapper {

    // --- toEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    public abstract OneTimeAvailability toEntity(OneTimeAvailabilityCreationRequest request, Integer userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    public abstract RecurringAvailability toEntity(RecurringAvailabilityCreationRequest request, Integer userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityException toEntity(AvailabilityExceptionCreationRequest request, Integer userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityException toEntity(AvailabilityExceptionOnboardingCreationRequest request,
                                   Integer userId, Integer recurringAvailabilityId);

    // --- updateEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    public abstract void updateEntity(OneTimeAvailabilityUpdateRequest request, @MappingTarget OneTimeAvailability availability);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "timeZoneId", ignore = true)
    public abstract void updateEntity(RecurringAvailabilityUpdateRequest request, @MappingTarget RecurringAvailability availability);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "cancelled", source = "isCancelled") //JavaBeans omits "is" from property names
    public abstract void updateEntity(AvailabilityExceptionUpdateRequest request, @MappingTarget AvailabilityException exception);

    // --- toResponse mappings ---

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    public abstract OneTimeAvailabilityResponse toOneTimeResponse(OneTimeAvailability availability);

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    public abstract RecurringAvailabilityResponse toRecurringResponse(RecurringAvailability availability);

    @Mapping(target = "isCancelled", source = "cancelled") //JavaBeans omits "is" from property names
    @Mapping(target = "overrideLocation", source = "overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityExceptionResponse toExceptionResponse(AvailabilityException exception);

    // --- toInterval mappings for conflict checking ---

    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME)")
    @Mapping(target = "sourceId", source = "id")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "start", source = "start")
    @Mapping(target = "end",  expression = "java(calculateEndOffsetDateTime(availability.getStart(), availability.getDuration()))")
    public abstract AvailabilityInterval toInterval(OneTimeAvailability availability);

    /**
     * Map an occurrence of a RecurringAvailability to an AvailabilityInterval.
     */
    public AvailabilityInterval toInterval(RecurringAvailability availability, LocalDate occurrence) {
        OffsetDateTime start = calculateOffsetDateTime(occurrence,
                                                       availability.getStartTime(),
                                                       ZoneId.of(availability.getTimeZoneId()));
        OffsetDateTime end = calculateEndOffsetDateTime(start, availability.getDuration());

        return new AvailabilityInterval(AvailabilityType.RECURRING,
                                        availability.getId(),
                                        availability.getLocation(),
                                        start,
                                        end);
    }

    /**
     * Map an AvailabilityException to an AvailabilityInterval.
     */
    public AvailabilityInterval toInterval(AvailabilityException exception,
                                    RecurringAvailability recurringAvailability) {
        Point location = exception.getOverrideLocation() != null
                ? exception.getOverrideLocation()
                : recurringAvailability.getLocation();
        LocalTime startTime = exception.getOverrideStartTime() != null
                ? exception.getOverrideStartTime()
                : recurringAvailability.getStartTime();
        Duration duration = exception.getOverrideDuration() != null
                ? exception.getOverrideDuration()
                : recurringAvailability.getDuration();

        OffsetDateTime start = calculateOffsetDateTime(exception.getExceptionDate(), startTime,
                                                       ZoneId.of(recurringAvailability.getTimeZoneId()));
        OffsetDateTime end = calculateEndOffsetDateTime(start, duration);

        return new AvailabilityInterval(AvailabilityType.EXCEPTION,
                                        exception.getId(),
                                        location,
                                        start,
                                        end);
    }

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    public abstract AvailabilityIntervalResponse toIntervalResponse(AvailabilityInterval interval);

    // --- private helper methods ---

    protected OffsetDateTime calculateOffsetDateTime(LocalDate date, LocalTime time, ZoneId zoneId) {
        return date.atTime(time).atZone(zoneId).toOffsetDateTime();
    }

    protected OffsetDateTime calculateEndOffsetDateTime(OffsetDateTime start, Duration duration) {
        return start.plus(duration);
    }

}
