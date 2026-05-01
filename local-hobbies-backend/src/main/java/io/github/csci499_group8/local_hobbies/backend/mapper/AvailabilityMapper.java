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
import org.springframework.beans.factory.annotation.Autowired;

import java.time.*;
import java.util.UUID;

@Mapper(componentModel = "spring",
        imports = {AvailabilityType.class},
        uses = { JsonNullableMapper.class, LocationMapper.class })
public abstract class AvailabilityMapper {

    @Autowired
    protected JsonNullableMapper jsonNullableMapper;

    @Autowired
    protected LocationMapper locationMapper;

    // --- toEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    public abstract OneTimeAvailability toEntity(OneTimeAvailabilityCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    public abstract RecurringAvailability toEntity(RecurringAvailabilityCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityException toEntity(AvailabilityExceptionCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityException toEntity(AvailabilityExceptionOnboardingCreationRequest request,
                                   UUID userId, UUID recurringAvailabilityId);

    // --- updateEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "location", expression = "java(jsonNullableMapper.unwrap(request.location(), availability.getLocation(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "start", expression = "java(jsonNullableMapper.unwrap(request.start(), availability.getStart()))")
    @Mapping(target = "duration", expression = "java(jsonNullableMapper.unwrap(request.duration(), availability.getDuration()))")
    public abstract void updateEntity(OneTimeAvailabilityUpdateRequest request, @MappingTarget OneTimeAvailability availability);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "location", expression = "java(jsonNullableMapper.unwrap(request.location(), availability.getLocation(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "ruleStart", expression = "java(jsonNullableMapper.unwrap(request.ruleStart(), availability.getRuleStart()))")
    @Mapping(target = "ruleEnd", expression = "java(jsonNullableMapper.unwrap(request.ruleEnd(), availability.getRuleEnd()))")
    @Mapping(target = "frequency", expression = "java(jsonNullableMapper.unwrap(request.frequency(), availability.getFrequency()))")
    @Mapping(target = "startDayOfWeek", expression = "java(jsonNullableMapper.unwrap(request.startDayOfWeek(), availability.getStartDayOfWeek()))")
    @Mapping(target = "startDayOfMonth", expression = "java(jsonNullableMapper.unwrap(request.startDayOfMonth(), availability.getStartDayOfMonth()))")
    @Mapping(target = "startTime", expression = "java(jsonNullableMapper.unwrap(request.startTime(), availability.getStartTime()))")
    @Mapping(target = "duration", expression = "java(jsonNullableMapper.unwrap(request.duration(), availability.getDuration()))")
    @Mapping(target = "timeZoneId", ignore = true)
    public abstract void updateEntity(RecurringAvailabilityUpdateRequest request, @MappingTarget RecurringAvailability availability);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "recurringAvailabilityId", ignore = true)
    @Mapping(target = "exceptionDate", ignore = true)
    @Mapping(target = "exceptionReason", expression = "java(jsonNullableMapper.unwrap(request.exceptionReason(), exception.getExceptionReason()))")
    @Mapping(target = "cancelled", expression = "java(jsonNullableMapper.unwrap(request.isCancelled(), exception.isCancelled()))") //JavaBeans omits "is" from property names
    @Mapping(target = "overrideLocation", expression = "java(jsonNullableMapper.unwrap(request.overrideLocation(), exception.getOverrideLocation(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "overrideStartTime", expression = "java(jsonNullableMapper.unwrap(request.overrideStartTime(), exception.getOverrideStartTime()))")
    @Mapping(target = "overrideDuration", expression = "java(jsonNullableMapper.unwrap(request.overrideDuration(), exception.getOverrideDuration()))")
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

    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME_AVAILABILITY)")
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

        return new AvailabilityInterval(AvailabilityType.RECURRING_AVAILABILITY,
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

        return new AvailabilityInterval(AvailabilityType.AVAILABILITY_EXCEPTION,
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
