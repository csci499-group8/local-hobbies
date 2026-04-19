package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.dto.user.UserOnboardingRequest;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.AvailabilityMapper;
import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.UserOwned;
import io.github.csci499_group8.local_hobbies.backend.repository.AvailabilityExceptionRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.OneTimeAvailabilityRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.RecurringAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.OVERLAP_WINDOW_DAYS;
import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.SCHEDULING_WINDOW_DAYS;
import static io.github.csci499_group8.local_hobbies.backend.service.LocationService.calculateDistanceKilometers;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    //TODO: add ruleStart < ruleEnd verification to RecurringAvailability
    //TODO: add verification to Recurring update that update duration <= 1 week
    //TODO: after converting OneTime duration (Duration) to end (timestamp), add verification to update that updated duration <= 1 week

    private final OneTimeAvailabilityRepository oneTimeRepository;
    private final RecurringAvailabilityRepository recurringRepository;
    private final AvailabilityExceptionRepository exceptionRepository;
    private final AvailabilityMapper availabilityMapper;

    private record ExceptionKey(Integer sourceId, LocalDate date) {}

    // --- methods called by AvailabilityController ---

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(Integer userId) {
        List<AvailabilityInterval> intervals = projectScheduleToIntervals(
                userId, LocalDate.now(), LocalDate.now().plusDays(SCHEDULING_WINDOW_DAYS)
        );

        ScheduleResponse.Availabilities availabilities = new ScheduleResponse.Availabilities(
                oneTimeRepository.findAllByUserId(userId).stream()
                                 .map(availabilityMapper::toOneTimeResponse)
                                 .toList(),
                recurringRepository.findAllByUserId(userId).stream()
                                   .map(availabilityMapper::toRecurringResponse)
                                   .toList(),
                exceptionRepository.findAllByUserId(userId).stream()
                                   .map(availabilityMapper::toExceptionResponse)
                                   .toList()
        );

        return new ScheduleResponse(intervals, availabilities);
    }

    @Transactional
    public OneTimeAvailabilityResponse createOneTime(Integer userId,
                                                     OneTimeAvailabilityCreationRequest request) {
        OneTimeAvailability availability = availabilityMapper.toEntity(request, userId);

        verifyNoConflicts(userId, availabilityMapper.toInterval(availability));

        return availabilityMapper.toOneTimeResponse(oneTimeRepository.save(availability));
    }

    @Transactional
    public OneTimeAvailabilityResponse updateOneTime(Integer userId, Integer oneTimeId,
                                                     OneTimeAvailabilityUpdateRequest request) {
        OneTimeAvailability availability = findAvailabilityByUserAndId(userId, oneTimeId, oneTimeRepository);

        availabilityMapper.updateEntity(request, availability);

        verifyNoConflicts(userId, availabilityMapper.toInterval(availability), oneTimeId);

        return availabilityMapper.toOneTimeResponse(oneTimeRepository.save(availability));
    }

    @Transactional
    public void deleteOneTime(Integer userId, Integer oneTimeId) {
        deleteAvailability(userId, oneTimeId, oneTimeRepository);
    }

    @Transactional
    public RecurringAvailabilityResponse createRecurring(Integer userId,
                                                         RecurringAvailabilityCreationRequest request) {
        RecurringAvailability availability = availabilityMapper.toEntity(request, userId);

        getRecurringOccurrences(availability, LocalDate.now(),
                                LocalDate.now().plusDays(SCHEDULING_WINDOW_DAYS)).forEach(
                occurrence -> verifyNoConflicts(userId, availabilityMapper.toInterval(availability, occurrence))
        );

        return availabilityMapper.toRecurringResponse(recurringRepository.save(availability));
    }

    @Transactional
    public RecurringAvailabilityResponse updateRecurring(Integer userId, Integer recurringId,
                                                         RecurringAvailabilityUpdateRequest request) {
        RecurringAvailability availability = findAvailabilityByUserAndId(userId, recurringId, recurringRepository);

        availabilityMapper.updateEntity(request, availability);

        getRecurringOccurrences(availability, LocalDate.now(),
                                LocalDate.now().plusDays(SCHEDULING_WINDOW_DAYS)).forEach(
                occurrence -> verifyNoConflicts(userId, availabilityMapper.toInterval(availability, occurrence), recurringId)
        );

        return availabilityMapper.toRecurringResponse(recurringRepository.save(availability));
    }

    @Transactional
    public void deleteRecurring(Integer userId, Integer recurringId) {
        deleteAvailability(userId, recurringId, recurringRepository);
    }

    //TODO: logic for ensuring exception date is a recurring date
    //TODO: extract above + logic for fetching recurring availability?
    @Transactional
    public AvailabilityExceptionResponse createException(Integer userId,
                                                         AvailabilityExceptionCreationRequest request) {
        AvailabilityException exception = availabilityMapper.toEntity(request, userId);

        Integer recurringId = exception.getRecurringAvailabilityId();
        RecurringAvailability recurringAvailability = recurringRepository.findById(recurringId).orElseThrow(
                () -> new ResourceNotFoundException("Recurring availability not found with ID: " + recurringId)
        );

        verifyNoConflicts(userId, availabilityMapper.toInterval(exception, recurringAvailability));

        return availabilityMapper.toExceptionResponse(exceptionRepository.save(exception));
    }

    //TODO: logic for ensuring exception date is a recurring date
    //TODO: extract above + logic for fetching recurring availability?
    @Transactional
    public AvailabilityExceptionResponse updateException(Integer userId, Integer exceptionId,
                                                         AvailabilityExceptionUpdateRequest request) {
        AvailabilityException exception = findAvailabilityByUserAndId(userId, exceptionId, exceptionRepository);

        availabilityMapper.updateEntity(request, exception);

        Integer recurringId = exception.getRecurringAvailabilityId();
        RecurringAvailability recurringAvailability = recurringRepository.findById(recurringId).orElseThrow(
                () -> new ResourceNotFoundException("Recurring availability not found with ID: " + recurringId)
        );

        verifyNoConflicts(userId, availabilityMapper.toInterval(exception, recurringAvailability), exceptionId);

        return availabilityMapper.toExceptionResponse(exceptionRepository.save(exception));
    }

    @Transactional
    public void deleteException(Integer userId, Integer exceptionId) {
        deleteAvailability(userId, exceptionId, exceptionRepository);

        //TODO: if an exception is deleted, should server send RecurringAvailability or should client request refresh?
    }

    // --- methods called by services

    //count only one-time and recurring because exceptions do not exist independently
    @Transactional(readOnly = true)
    public Integer getAvailabilityCount(Integer userId) {
        return (oneTimeRepository.countByUserId(userId)
                + recurringRepository.countByUserId(userId));
    }

    @Transactional
    public void addOnboardingAvailabilities(Integer userId, UserOnboardingRequest request) {
        verifyNoConflictsOnboarding(userId, request);

        //save availabilities to database

        List<OneTimeAvailability> oneTimes = request.availabilities().oneTimes().stream()
                                                    .map(req -> availabilityMapper.toEntity(req, userId))
                                                    .toList();
        oneTimeRepository.saveAll(oneTimes);

        for (AvailabilityOnboardingRequests.RecurringAvailabilityWithExceptions recWithExcRequest
                : request.availabilities().recurringsWithExceptions()) {
            RecurringAvailability recurring = availabilityMapper.toEntity(recWithExcRequest.recurring(), userId);

            Integer recurringId = recurringRepository.save(recurring).getId();

            List<AvailabilityException> exceptions = recWithExcRequest.exceptions().stream()
                      .map(req -> availabilityMapper.toEntity(req, userId, recurringId))
                      .toList();
            exceptionRepository.saveAll(exceptions);
        }
    }

    @Transactional(readOnly = true)
    public List<AvailabilityOverlapResponse> getOverlappingAvailabilities(Integer currentUserId,
                                                                          Integer otherUserId) {
        List<AvailabilityInterval> currentUserAvailabilities =
                projectScheduleToIntervals(currentUserId, LocalDate.now(), LocalDate.now().plusDays(OVERLAP_WINDOW_DAYS));
        List<AvailabilityInterval> otherUserAvailabilities =
                projectScheduleToIntervals(otherUserId, LocalDate.now(), LocalDate.now().plusDays(OVERLAP_WINDOW_DAYS));
        
        
        List<AvailabilityOverlapResponse> overlaps = new ArrayList<>();
        int currIndex = 0;
        int otherIndex = 0;
        
        while (currIndex < currentUserAvailabilities.size() && otherIndex < otherUserAvailabilities.size()) {
            AvailabilityInterval currInterval = currentUserAvailabilities.get(currIndex);
            AvailabilityInterval otherInterval = otherUserAvailabilities.get(otherIndex);

            if (currInterval.overlaps(otherInterval)) {
                OffsetDateTime start = currInterval.start().isAfter(otherInterval.start()) ? currInterval.start() : otherInterval.start();
                OffsetDateTime end = currInterval.end().isBefore(otherInterval.end()) ? currInterval.end() : otherInterval.end();

                overlaps.add(new AvailabilityOverlapResponse(
                        calculateDistanceKilometers(currInterval.location(), otherInterval.location()),
                        start,
                        end));
            }

            //increment index of whichever interval ends earlier
            if (currInterval.end().isBefore(otherInterval.end())) {
                currIndex++;
            } else {
                otherIndex++;
            }
        }

        return overlaps;
    }

    // --- private helper methods ---

    /**
     * Verify that availability/exception exists and that request is authorized.
     * Log unauthorized requests.
     * @throws ResourceNotFoundException if availability does not exist or request
     *         is unauthorized
     */
    private <E extends UserOwned> E findAvailabilityByUserAndId(Integer userId,
                                                                Integer availabilityId,
                                                                JpaRepository<E, Integer> repository) {
        E availability = repository.findById(availabilityId).orElseThrow(
                () -> new ResourceNotFoundException(
                        "Availability or availability exception not found with ID: " + availabilityId
                )
        );

        //verify ownership
        if (!availability.getUserId().equals(userId)) {
            //log forbidden request
            throw new ResourceNotFoundException(
                    "Availability or availability exception not found with ID: " + availabilityId
            );
        }
        return availability;
    }

    private <E extends UserOwned> void deleteAvailability(Integer userId,
                                        Integer availabilityId,
                                        JpaRepository<E, Integer> repository) {
        E availability = findAvailabilityByUserAndId(userId, availabilityId, repository);

        repository.delete(availability);
    }

    //TODO: use for AvailabilityException save requests to skip comparison against the parent RecurringAvailability
    /**
     * Verify that a creation or update request does not conflict with the user's
     * current schedule.
     * @param excludedId ID of the stored availability; used for update requests
     *                   to skip comparison against the stored availability because
     *                   the update's contents likely overlap with the stored
     *                   availability's
     */
    private void verifyNoConflicts(Integer userId, AvailabilityInterval newInterval, Integer excludedId) {
        //availabilities can have durations up to 1 week, so check for conflicts within 1 week
        LocalDate windowStart = newInterval.start().toLocalDate().minusWeeks(1);
        LocalDate windowEnd = newInterval.end().toLocalDate().plusWeeks(1);

        List<AvailabilityInterval> existingIntervals = projectScheduleToIntervals(userId, windowStart, windowEnd);

        boolean hasConflict = existingIntervals.stream()
                                               .filter(existing -> !existing.sourceId().equals(excludedId))
                                               .anyMatch(existing -> existing.overlaps(newInterval));
        //TODO: optimize anyMatch to ignore existing recurrings that were already checked?

        if (hasConflict) {
            throw new IllegalStateException("New availability conflicts with an existing availability");
        }
    }

    private void verifyNoConflicts(Integer userId, AvailabilityInterval interval) {
        verifyNoConflicts(userId, interval, null);
    }

    /**
     * Project a user's schedule to a list of AvailabilityIntervals.
     * @return list of all AvailabilityIntervals for a user's availabilities,
     *         sorted by start timestamp
     */
    private List<AvailabilityInterval> projectScheduleToIntervals(Integer userId,
                                                                  LocalDate windowStart,
                                                                  LocalDate windowEnd) {
        Stream<AvailabilityInterval> oneTimeStream =
                projectOneTimesToIntervals(userId, windowStart, windowEnd).stream();
        Stream<AvailabilityInterval> recurringStream =
                projectRecurringsToIntervals(userId, windowStart, windowEnd).stream();

        return Stream.concat(oneTimeStream, recurringStream)
                     .sorted(Comparator.comparing(AvailabilityInterval::start))
                     .toList();
    }

    /**
     * Project a user's OneTimeAvailabilities to a list of AvailabilityIntervals.
     * @return list of AvailabilityIntervals for a user's RecurringAvailabilities
     */
    private List<AvailabilityInterval> projectOneTimesToIntervals(Integer userId,
                                                                  LocalDate windowStart,
                                                                  LocalDate windowEnd) {
        return oneTimeRepository.findAllByUserId(userId).stream()
                                .filter(availability -> { //limit search window
                                    return availability.getStart().toLocalDate().isBefore(windowEnd)
                                            && availability.getStart().plus(availability.getDuration()).toLocalDate().isAfter(windowStart); //TODO: stop using Duration?
                                })
                                .map(availabilityMapper::toInterval)
                                .toList();
    }

    /**
     * Project a user's RecurringAvailabilities to a list of AvailabilityIntervals.
     * Each RecurringAvailability is expanded into a list of AvailabilityIntervals
     * within the WITHIN_DAYS time window. Intervals are removed or replaced as
     * indicated by the user's AvailabilityExceptions.
     * @return list of AvailabilityIntervals for a user's RecurringAvailabilities
     */
    private List<AvailabilityInterval> projectRecurringsToIntervals(Integer userId,
                                                                    LocalDate windowStart,
                                                                    LocalDate windowEnd) {
        //map exceptions from (source availability ID, exception date) to (exception)
        Map<ExceptionKey, AvailabilityException> exceptionMap =
                exceptionRepository.findAllByUserId(userId).stream().collect(Collectors.toMap(
                        e -> new ExceptionKey(e.getRecurringAvailabilityId(), e.getExceptionDate()),
                        e -> e
                ));

        return recurringRepository.findAllByUserId(userId).stream().flatMap(
                availability -> {
                    return getRecurringOccurrences(availability, windowStart, windowEnd).stream().map(
                            occurrence -> {
                                //check if this occurrence has an exception
                                ExceptionKey key = new ExceptionKey(availability.getId(),
                                                                    occurrence);
                                AvailabilityException exception = exceptionMap.get(key);

                                if (exception == null) { //if no exception, return recurring interval
                                    return availabilityMapper.toInterval(availability, occurrence);
                                }
                                if (!exception.getIsCancelled()) { //if exception is an override, return override
                                    return availabilityMapper.toInterval(exception, availability);
                                }
                                return null; //if exception is a cancellation, return null
                            });
                })
                .filter(Objects::nonNull)
                .toList();
    }

    private List<LocalDate> getRecurringOccurrences(RecurringAvailability availability,
                                                    LocalDate windowStart, LocalDate windowEnd) {
        if (availability.getRuleStart().isAfter(windowStart)) {
            windowStart = availability.getRuleStart();
        }
        if (availability.getRuleEnd() != null && availability.getRuleEnd().isBefore(windowEnd)) {
            windowEnd = availability.getRuleEnd();
        }

        List<LocalDate> occurrences = new ArrayList<>();
        switch (availability.getFrequency()) {
            case WEEKLY -> {
                LocalDate current = windowStart.with(
                        TemporalAdjusters.nextOrSame(availability.getStartDayOfWeek()));

                while (!current.isAfter(windowEnd)) {
                    occurrences.add(current);
                    current = current.plusWeeks(1);
                }
            }
            case EVERY_TWO_WEEKS -> {
                LocalDate current = windowStart.with(
                        TemporalAdjusters.nextOrSame(availability.getStartDayOfWeek()));

                while (!current.isAfter(windowEnd)) {
                    occurrences.add(current);
                    current = current.plusWeeks(2);
                }
            }
            case MONTHLY -> {
                int targetDay = availability.getStartDayOfMonth();
                LocalDate currentMonth = windowStart.withDayOfMonth(1);

                while (!currentMonth.isAfter(windowEnd)) {
                    if (targetDay <= currentMonth.lengthOfMonth()) {
                        LocalDate occurrenceCandidate = currentMonth.withDayOfMonth(targetDay);

                        if (!occurrenceCandidate.isBefore(windowStart)
                                && !occurrenceCandidate.isAfter(windowEnd)) {
                            occurrences.add(occurrenceCandidate);
                        }
                    }

                    currentMonth = currentMonth.plusMonths(1);
                }
            }
        }

        return occurrences;
    }

    private void verifyNoConflictsOnboarding(Integer userId, UserOnboardingRequest request) {

        //project requests to intervals

        Stream<AvailabilityInterval> oneTimes = request.availabilities().oneTimes().stream()
                                                       .map(oneTime -> availabilityMapper.toEntity(oneTime, userId))
                                                       .map(availabilityMapper::toInterval);

        Stream<AvailabilityInterval> recurrings = request.availabilities().recurringsWithExceptions().stream().flatMap(
                 recWithExc -> {
                     RecurringAvailability recurring = availabilityMapper.toEntity(recWithExc.recurring(), userId);
                     Map<LocalDate, AvailabilityException> exceptionMap =
                             recWithExc.exceptions().stream().collect(Collectors.toMap(
                                     e -> e.exceptionDate(),
                                     e -> availabilityMapper.toEntity(e, userId, null))
                             );

                     return getRecurringOccurrences(recurring, LocalDate.now(), LocalDate.now().plusDays(
                             SCHEDULING_WINDOW_DAYS)).stream().map(
                             occurrence -> {
                                 AvailabilityException exception = exceptionMap.get(occurrence);

                                 if (exception == null) { //if no exception, return recurring interval
                                     return availabilityMapper.toInterval(recurring, occurrence);
                                 }
                                 if (!exception.getIsCancelled()) { //if exception is an override, return override
                                     return availabilityMapper.toInterval(exception, recurring);
                                 }
                                 return null; //if exception is a cancellation, return null
                             }
                     );
                 })
                 .filter(Objects::nonNull);

        //sort intervals by start time and check each interval with the next one for overlap

        List<AvailabilityInterval> intervals = Stream.concat(oneTimes, recurrings)
                                                     .sorted(Comparator.comparing(AvailabilityInterval::start))
                                                     .toList();

        for (int i = 0; i < intervals.size() - 1; i++) {
            AvailabilityInterval current = intervals.get(i);
            AvailabilityInterval next = intervals.get(i + 1);

            if (current.overlaps(next)) {
                OffsetDateTime overlapStart = current.start().isAfter(next.start()) ? current.start() : next.start();
                throw new IllegalStateException("There is an availability conflict at "
                                                        + overlapStart.toLocalTime()
                                                        + " (UTC" + overlapStart.getOffset() + ")");
            }
        }
    }

}
