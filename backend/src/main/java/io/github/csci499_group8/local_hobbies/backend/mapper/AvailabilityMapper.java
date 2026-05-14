package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityType;
import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityInterval;
import io.github.csci499_group8.local_hobbies.backend.service.LocationService;
import org.locationtech.jts.geom.Point;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.*;
import java.util.UUID;

@Mapper(componentModel = "spring",
        imports = {AvailabilityType.class},
        uses = { LocationService.class, JsonNullableMapper.class, LocationMapper.class })
public abstract class AvailabilityMapper {

    @Autowired
    protected LocationService locationService;

    @Autowired
    protected JsonNullableMapper jsonNullableMapper;

    @Autowired
    protected LocationMapper locationMapper;

    // --- toEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    @Mapping(target = "start", expression = "java(resolveOffsetDateTime(request.location(), request.date(), request.startTime()))")
    public abstract OneTimeAvailability toEntity(OneTimeAvailabilityCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "location", source = "request.location") //automatically maps by calling LocationMapper method
    @Mapping(target = "timeZoneId", expression = "java(resolveTimeZoneId(request.location()))")
    public abstract RecurringAvailability toEntity(RecurringAvailabilityCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    @Mapping(target = "overrideTimeZoneId", expression = "java(resolveTimeZoneId(request.overrideLocation()))")
    public abstract AvailabilityException toEntity(AvailabilityExceptionCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overrideLocation", source = "request.overrideLocation") //automatically maps by calling LocationMapper method
    @Mapping(target = "overrideTimeZoneId", expression = "java(resolveTimeZoneId(request.overrideLocation()))")
    public abstract AvailabilityException toEntity(AvailabilityExceptionOnboardingCreationRequest request,
                                                   UUID userId, UUID recurringAvailabilityId);

    // --- updateEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "location", expression = "java(jsonNullableMapper.unwrap(request.location(), availability.getLocation(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "start", expression = "java(resolveStart(request, availability))")
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
    @Mapping(target = "timeZoneId", expression = "java(resolveTimeZoneId(request.location(), availability.getTimeZoneId()))")
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
    @Mapping(target = "overrideTimeZoneId", expression = "java(resolveTimeZoneId(request.overrideLocation(), exception.getOverrideTimeZoneId()))")
    public abstract void updateEntity(AvailabilityExceptionUpdateRequest request, @MappingTarget AvailabilityException exception);

    // --- toResponse mappings ---

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    @Mapping(target = "date", expression = "java(resolveDate(availability.getLocation(), availability.getStart()))")
    @Mapping(target = "startTime", expression = "java(resolveTime(availability.getLocation(), availability.getStart()))")
    public abstract OneTimeAvailabilityResponse toOneTimeResponse(OneTimeAvailability availability);

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    public abstract RecurringAvailabilityResponse toRecurringResponse(RecurringAvailability availability);

    @Mapping(target = "isCancelled", source = "cancelled") //JavaBeans omits "is" from property names
    @Mapping(target = "overrideLocation", source = "overrideLocation") //automatically maps by calling LocationMapper method
    public abstract AvailabilityExceptionResponse toExceptionResponse(AvailabilityException exception);

    @Mapping(target = "location", source = "location") //automatically maps by calling LocationMapper method
    public abstract AvailabilityIntervalResponse toIntervalResponse(AvailabilityInterval interval);

    // --- toInterval mappings for conflict checking ---

    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME_AVAILABILITY)")
    @Mapping(target = "sourceId", source = "id")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "start", source = "start")
    @Mapping(target = "end",  expression = "java(availability.getStart().plus(availability.getDuration()))")
    public abstract AvailabilityInterval toInterval(OneTimeAvailability availability);

    /**
     * Map an occurrence of a RecurringAvailability to an AvailabilityInterval.
     */
    public AvailabilityInterval toInterval(RecurringAvailability availability, LocalDate occurrence) {
        OffsetDateTime start = occurrence.atTime(availability.getStartTime())
                                         .atZone(ZoneId.of(availability.getTimeZoneId()))
                                         .toOffsetDateTime();
        OffsetDateTime end = start.plus(availability.getDuration());

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
        ZoneId zoneId = exception.getOverrideTimeZoneId() != null
                ? ZoneId.of(exception.getOverrideTimeZoneId())
                : ZoneId.of(recurringAvailability.getTimeZoneId());
        Duration duration = exception.getOverrideDuration() != null
                ? exception.getOverrideDuration()
                : recurringAvailability.getDuration();

        OffsetDateTime start = exception.getExceptionDate().atTime(startTime)
                                        .atZone(zoneId).toOffsetDateTime();
        OffsetDateTime end = start.plus(duration);

        return new AvailabilityInterval(AvailabilityType.AVAILABILITY_EXCEPTION,
                                        exception.getId(),
                                        location,
                                        start,
                                        end);
    }

    // --- private helper methods ---

    //called by RecurringAvailability and AvailabilityException's toEntity()
    protected String resolveTimeZoneId(GeoJsonPoint location) {
        if (location == null) return null; //case: no AvailabilityException overrideLocation

        return locationService.getTimeZoneOfGeoJsonPoint(location).getId();
    }

    //called by RecurringAvailability and AvailabilityException's updateEntity()
    protected String resolveTimeZoneId(JsonNullable<GeoJsonPoint> newLocation, String currentTimeZoneId) {
        boolean isExplicitNull = newLocation != null && newLocation.isPresent() && newLocation.get() == null;
        boolean isAbsent = newLocation == null || !newLocation.isPresent();

        if (isExplicitNull || (isAbsent && currentTimeZoneId == null)) {
            return null;
        }

        return jsonNullableMapper.unwrap(newLocation,
                                         currentTimeZoneId,
                                         point -> locationService.getTimeZoneOfGeoJsonPoint(point).getId());
    }

    //called by OneTimeAvailability's toEntity()
    protected OffsetDateTime resolveOffsetDateTime(GeoJsonPoint location, LocalDate date, LocalTime time) {
        ZoneId zoneId = locationService.getTimeZoneOfGeoJsonPoint(location);
        return date.atTime(time).atZone(zoneId).toOffsetDateTime();
    }

    //called by OneTimeAvailability's updateEntity()
    public OffsetDateTime resolveStart(OneTimeAvailabilityUpdateRequest request, OneTimeAvailability availability) {
        boolean newLocation = request.location() != null && request.location().isPresent();
        boolean newDate = request.date() != null && request.date().isPresent();
        boolean newTime = request.startTime() != null && request.startTime().isPresent();

        if (newLocation || newDate || newTime) {
            ZoneId zoneId = ZoneId.of(resolveTimeZoneId(
                    request.location(),
                    locationService.getTimeZoneOfPoint(availability.getLocation()).getId())
            );

            LocalDate date = jsonNullableMapper.unwrap(request.date(), availability.getStart().toLocalDate());

            LocalTime startTime = jsonNullableMapper.unwrap(request.startTime(), availability.getStart().toLocalTime());

            return date.atTime(startTime).atZone(zoneId).toOffsetDateTime();
        };

        return availability.getStart();
    }

    //called by toOneTimeResponse()
    protected LocalDate resolveDate(Point location, OffsetDateTime dateTime) {
        return dateTime.atZoneSameInstant(locationService.getTimeZoneOfPoint(location))
                       .toLocalDate();
    }

    //called by toOneTimeResponse()
    protected LocalTime resolveTime(Point location, OffsetDateTime dateTime) {
        return dateTime.atZoneSameInstant(locationService.getTimeZoneOfPoint(location))
                       .toLocalTime();
    }

}
