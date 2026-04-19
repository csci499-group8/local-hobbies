package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityInterval;
import org.locationtech.jts.geom.Point;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.*;
import java.util.List;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {AvailabilityType.class})
public interface AvailabilityMapper {

    // --- toEntity mappings ---

    OneTimeAvailability toEntity(OneTimeAvailabilityCreationRequest request, Integer userId);

    void updateEntity(OneTimeAvailabilityUpdateRequest request, OneTimeAvailability availability);

    RecurringAvailability toEntity(RecurringAvailabilityCreationRequest request, Integer userId);

    void updateEntity(RecurringAvailabilityUpdateRequest request, RecurringAvailability availability);

    AvailabilityException toEntity(AvailabilityExceptionCreationRequest request, Integer userId);

    AvailabilityException toEntity(AvailabilityExceptionOnboardingCreationRequest request, Integer userId, Integer sourceAvailabilityId);

    void updateEntity(AvailabilityExceptionUpdateRequest request, AvailabilityException availability);

    // --- toResponse mappings ---

    OneTimeAvailabilityResponse toOneTimeResponse(OneTimeAvailability save);

    RecurringAvailabilityResponse toRecurringResponse(RecurringAvailability save);

    AvailabilityExceptionResponse toExceptionResponse(AvailabilityException save);

    // --- toInterval mappings for conflict checking ---

    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME)")
    @Mapping(target = "sourceId", source = "id")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "start", source = "start")
    @Mapping(target = "end",  expression = "java(calculateEndOffsetDateTime(availability.getStart(), availability.getDuration()))")
    AvailabilityInterval toInterval(OneTimeAvailability availability);

    /**
     * Map an occurrence of a RecurringAvailability to an AvailabilityInterval.
     */
    default AvailabilityInterval toInterval(RecurringAvailability availability, LocalDate occurrence) {
        OffsetDateTime start = calculateOffsetDateTime(occurrence,
                                                       availability.getStartTime(),
                                                       availability.getZoneId());
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
    default AvailabilityInterval toInterval(AvailabilityException exception,
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
                                                       recurringAvailability.getZoneId());
        OffsetDateTime end = calculateEndOffsetDateTime(start, duration);

        return new AvailabilityInterval(AvailabilityType.EXCEPTION,
                                        exception.getId(),
                                        location,
                                        start,
                                        end);
    }

//    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME)")
//    @Mapping(target = "sourceId", ignore = true)
//    @Mapping(target = "location", source = "location")
//    @Mapping(target = "start", source = "start")
//    @Mapping(target = "end", expression = "java(calculateEndOffsetDateTime(request.getStart(), request.getDuration()))")
//    AvailabilityInterval toInterval(OneTimeAvailabilityCreationRequest request);
//
//    @Mapping(target = "sourceType", expression = "java(AvailabilityType.ONE_TIME)")
//    @Mapping(target = "sourceId", source = "")
//    @Mapping(target = "location", source = "location")
//    @Mapping(target = "start", source = "start")
//    @Mapping(target = "end", expression = "java(calculateEndOffsetDateTime(request.getStart(), request.getDuration()))")
//    AvailabilityInterval toInterval(OneTimeAvailabilityUpdateRequest request);
//
//    AvailabilityInterval toInterval(RecurringAvailabilityCreationRequest request);
//
//    AvailabilityInterval toInterval(RecurringAvailabilityUpdateRequest request);
//
//    AvailabilityInterval toInterval(AvailabilityExceptionCreationRequest request);
//
//    AvailabilityInterval toInterval(AvailabilityExceptionUpdateRequest request);

    // --- private helper methods ---

    private OffsetDateTime calculateOffsetDateTime(LocalDate date, LocalTime time, ZoneId zoneId) {
        return date.atTime(time).atZone(zoneId).toOffsetDateTime();
    }

    private OffsetDateTime calculateEndOffsetDateTime(OffsetDateTime start, Duration duration) {
        return start.plus(duration);
    }

}
