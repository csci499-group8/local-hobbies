package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.AvailabilityMapper;
import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import io.github.csci499_group8.local_hobbies.backend.model.UserOwned;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityFrequency;
import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityType;
import io.github.csci499_group8.local_hobbies.backend.repository.AvailabilityExceptionRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.OneTimeAvailabilityRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.RecurringAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.github.csci499_group8.local_hobbies.backend.service.LocationService.calculateDistanceKilometers;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final OneTimeAvailabilityRepository oneTimeRepository;
    private final RecurringAvailabilityRepository recurringRepository;
    private final AvailabilityExceptionRepository exceptionRepository;
    private final AvailabilityMapper availabilityMapper;
    
    @Value("${application.availability.scheduling-window-days}")
    private int schedulingWindowDays;
    @Value("${application.availability.overlap-window-days}")
    private int overlapWindowDays;
    @Value("${application.availability.max-duration-hours}")
    private int maxDurationHours;

    private record ExceptionKey(UUID sourceId, LocalDate date) {}

    // --- methods called by AvailabilityController ---

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(UUID userId) {
        List<AvailabilityIntervalResponse> intervals =
            projectScheduleToIntervals(userId, LocalDate.now(), LocalDate.now().plusDays(schedulingWindowDays))
            .stream()
            .map(availabilityMapper::toIntervalResponse)
            .toList();

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
    public OneTimeAvailabilityResponse createOneTime(UUID userId,
                                                     OneTimeAvailabilityCreationRequest request) {
        OneTimeAvailability availability = availabilityMapper.toEntity(request, userId);

        verifyNoConflicts(userId, availabilityMapper.toInterval(availability));

        return availabilityMapper.toOneTimeResponse(oneTimeRepository.save(availability));
    }

    @Transactional
    public OneTimeAvailabilityResponse updateOneTime(UUID userId, UUID oneTimeId,
                                                     OneTimeAvailabilityUpdateRequest request) {
        OneTimeAvailability availability = findAvailabilityByUserIdAndId(userId, oneTimeId, oneTimeRepository,
                                                                         AvailabilityType.ONE_TIME_AVAILABILITY);

        availabilityMapper.updateEntity(request, availability);

        verifyNoConflicts(userId, availabilityMapper.toInterval(availability));

        return availabilityMapper.toOneTimeResponse(oneTimeRepository.save(availability));
    }

    @Transactional
    public void deleteOneTime(UUID userId, UUID oneTimeId) {
        deleteAvailability(userId, oneTimeId, oneTimeRepository, AvailabilityType.ONE_TIME_AVAILABILITY);
    }

    @Transactional
    public RecurringAvailabilityResponse createRecurring(UUID userId,
                                                         RecurringAvailabilityCreationRequest request) {
        RecurringAvailability availability = availabilityMapper.toEntity(request, userId);

        getRecurringOccurrences(availability, LocalDate.now(),
                                LocalDate.now().plusDays(schedulingWindowDays)).forEach(
                occurrence -> verifyNoConflicts(userId, availabilityMapper.toInterval(availability, occurrence))
        );

        return availabilityMapper.toRecurringResponse(recurringRepository.save(availability));
    }

    @Transactional
    public RecurringAvailabilityResponse updateRecurring(UUID userId, UUID recurringId,
                                                         RecurringAvailabilityUpdateRequest request) {
        RecurringAvailability availability = findAvailabilityByUserIdAndId(userId, recurringId, recurringRepository,
                                                                           AvailabilityType.RECURRING_AVAILABILITY);

        //capture original values to check later if any exceptions become obsolete
        LocalDate originalRuleStart = availability.getRuleStart();
        LocalDate originalRuleEnd = availability.getRuleEnd();
        AvailabilityFrequency originalFrequency = availability.getFrequency();

        availabilityMapper.updateEntity(request, availability);

        if (availability.getRuleEnd() != null
            && availability.getRuleEnd().isBefore(availability.getRuleStart())) {
            throw new IllegalArgumentException("Rule end date must be after rule start date");
        }

        getRecurringOccurrences(availability, LocalDate.now(),
                                LocalDate.now().plusDays(schedulingWindowDays)).forEach(
                occurrence -> verifyNoConflicts(userId, availabilityMapper.toInterval(availability, occurrence)));

        deleteObsoleteExceptions(availability, originalRuleStart, originalRuleEnd, originalFrequency);

        return availabilityMapper.toRecurringResponse(recurringRepository.save(availability));
    }

    /**
     * Delete recurring availability and associated availability exceptions
     */
    @Transactional
    public void deleteRecurring(UUID userId, UUID recurringId) {
        deleteAvailability(userId, recurringId, recurringRepository, AvailabilityType.RECURRING_AVAILABILITY);
    }

    @Transactional
    public AvailabilityExceptionResponse createException(UUID userId,
                                                         AvailabilityExceptionCreationRequest request) {
        //ensure that exception date is a recurring date and that exception has not already been created for date

        LocalDate exceptionDate = request.exceptionDate();
        UUID recurringId = request.recurringAvailabilityId();

        RecurringAvailability recurringAvailability = recurringRepository.findById(recurringId).orElseThrow(
            () -> new ResourceNotFoundException("Recurring availability not found with ID: " + recurringId)
        );

        if (exceptionRepository.existsByExceptionDateAndRecurringAvailabilityId(exceptionDate, recurringId)) {
            throw new IllegalStateException("An exception already exists for date " + exceptionDate);
        }
        if (getRecurringOccurrences(recurringAvailability, exceptionDate, exceptionDate).isEmpty()) {
            throw new IllegalArgumentException("The date " + exceptionDate
                                                   + " is not a valid date for this recurring availability");
        }

        //standard creation behavior

        AvailabilityException exception = availabilityMapper.toEntity(request, userId);

        verifyNoConflicts(userId, availabilityMapper.toInterval(exception, recurringAvailability), recurringAvailability.getId());

        return availabilityMapper.toExceptionResponse(exceptionRepository.save(exception));
    }

    @Transactional
    public AvailabilityExceptionResponse updateException(UUID userId, UUID exceptionId,
                                                         AvailabilityExceptionUpdateRequest request) {
        AvailabilityException exception = findAvailabilityByUserIdAndId(userId, exceptionId, exceptionRepository,
                                                                        AvailabilityType.AVAILABILITY_EXCEPTION);

        availabilityMapper.updateEntity(request, exception);

        UUID recurringId = exception.getRecurringAvailabilityId();
        RecurringAvailability recurringAvailability = recurringRepository.findById(recurringId).orElseThrow(
                () -> new ResourceNotFoundException("Recurring availability not found with ID: " + recurringId)
        );

        verifyNoConflicts(userId, availabilityMapper.toInterval(exception, recurringAvailability), recurringId);

        return availabilityMapper.toExceptionResponse(exceptionRepository.save(exception));
    }

    @Transactional
    public void deleteException(UUID userId, UUID exceptionId) {
        deleteAvailability(userId, exceptionId, exceptionRepository, AvailabilityType.AVAILABILITY_EXCEPTION);
    }

    // --- methods called by services

    //count only one-time and recurring because exceptions do not exist independently
    @Transactional(readOnly = true)
    public Integer getAvailabilityCount(UUID userId) {
        return (oneTimeRepository.countByUserId(userId)
                + recurringRepository.countByUserId(userId));
    }

    @Transactional
    public void addOnboardingAvailabilities(UUID userId, AvailabilityOnboardingRequests requests) {
        verifyNoConflictsOnboarding(userId, requests);

        //save availabilities to database

        List<OneTimeAvailability> oneTimes = requests.oneTimes().stream()
                                                                 .map(req -> availabilityMapper.toEntity(req, userId))
                                                                 .toList();
        oneTimeRepository.saveAll(oneTimes);

        for (AvailabilityOnboardingRequests.RecurringAvailabilityWithExceptions recWithExcRequest
                : requests.recurringsWithExceptions()) {
            RecurringAvailability recurring = availabilityMapper.toEntity(recWithExcRequest.recurring(), userId);

            UUID recurringId = recurringRepository.save(recurring).getId();

            List<AvailabilityException> exceptions = recWithExcRequest.exceptions().stream()
                      .map(req -> availabilityMapper.toEntity(req, userId, recurringId))
                      .toList();
            exceptionRepository.saveAll(exceptions);
        }
    }

    @Transactional(readOnly = true)
    public List<AvailabilityOverlapResponse> getOverlappingAvailabilities(UUID currentUserId,
                                                                          UUID otherUserId) {
        List<AvailabilityInterval> currentUserAvailabilities =
                projectScheduleToIntervals(currentUserId, LocalDate.now(), LocalDate.now().plusDays(overlapWindowDays));
        List<AvailabilityInterval> otherUserAvailabilities =
                projectScheduleToIntervals(otherUserId, LocalDate.now(), LocalDate.now().plusDays(overlapWindowDays));


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
    private <E extends UserOwned> E findAvailabilityByUserIdAndId(UUID userId,
                                                                  UUID availabilityId,
                                                                  JpaRepository<E, UUID> repository,
                                                                  AvailabilityType availabilityType) {
        E availability = repository.findById(availabilityId).orElseThrow(
                () -> new ResourceNotFoundException(
                    availabilityType.getLabel() + " not found with ID: " + availabilityId));

        //verify ownership
        if (!availability.getUserId().equals(userId)) {
            log.warn("Unauthorized access attempt: User {} tried to access {} {} owned by user {}",
                     userId, availabilityType.getLabel().toLowerCase(), availabilityId, availability.getUserId());

            throw new ResourceNotFoundException(
                availabilityType.getLabel() + " not found with ID: " + availabilityId);
        }
        return availability;
    }

    private <E extends UserOwned> void deleteAvailability(UUID userId,
                                                          UUID availabilityId,
                                                          JpaRepository<E, UUID> repository,
                                                          AvailabilityType availabilityType) {
        E availability = findAvailabilityByUserIdAndId(userId, availabilityId, repository, availabilityType);

        repository.delete(availability);
    }

    /**
     * Delete any AvailabilityExceptions that have become obsolete due to changing
     * the parent RecurringAvailability's rule period or frequency.
     */
    private void deleteObsoleteExceptions(RecurringAvailability availability, LocalDate originalRuleStart,
                                          LocalDate originalRuleEnd, AvailabilityFrequency originalFrequency) {
        if (availability.getFrequency() != originalFrequency) {
            exceptionRepository.deleteByRecurringAvailabilityId(availability.getId());
        }
        //if new rule period does not overlap old rule period
        else if ((availability.getRuleEnd() != null && !originalRuleStart.isBefore(availability.getRuleEnd()))
            || (originalRuleEnd != null && !originalRuleEnd.isAfter(availability.getRuleStart()))) {
            exceptionRepository.deleteByRecurringAvailabilityId(availability.getId());
        }
        else {
            exceptionRepository.deleteByRecurringAvailabilityIdAndExceptionDateOutsideRange(availability.getId(),
                                                                                            availability.getRuleStart(),
                                                                                            availability.getRuleEnd());
        }
    }

    /**
     * Verify that a creation or update request does not conflict with the user's
     * current schedule.
     * @param parentRecurringId ID of an AvailabilityException's parent
     *                          RecurringAvailability, used to skip comparison
     *                          against the parent
     */
    private void verifyNoConflicts(UUID userId, AvailabilityInterval newInterval, UUID parentRecurringId) {
        //check for conflicts within range of availability max duration
        LocalDate windowStart = newInterval.start().minus(Duration.ofHours(maxDurationHours)).toLocalDate();
        LocalDate windowEnd = newInterval.end().plus(Duration.ofHours(maxDurationHours)).toLocalDate();

        List<AvailabilityInterval> existingIntervals = projectScheduleToIntervals(userId, windowStart, windowEnd);

        boolean hasConflict = existingIntervals.stream()
                                               .filter(existing ->
                                                           !existing.sourceId().equals(newInterval.sourceId())
                                                               && !existing.sourceId().equals(parentRecurringId))
                                               .anyMatch(existing -> existing.overlaps(newInterval));

        if (hasConflict) {
            throw new IllegalStateException("New availability conflicts with an existing availability");
        }
    }

    /**
     * Verify that a creation or update request for a OneTimeAvailability or a
     * RecurringAvailability does not conflict with the user's current schedule.
     */
    private void verifyNoConflicts(UUID userId, AvailabilityInterval interval) {
        verifyNoConflicts(userId, interval, null);
    }

    /**
     * Project a user's schedule to a list of AvailabilityIntervals.
     * @return list of all AvailabilityIntervals for a user's availabilities,
     *         sorted by start timestamp
     */
    private List<AvailabilityInterval> projectScheduleToIntervals(UUID userId,
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
    private List<AvailabilityInterval> projectOneTimesToIntervals(UUID userId,
                                                                  LocalDate windowStart,
                                                                  LocalDate windowEnd) {
        return oneTimeRepository.findAllByUserId(userId).stream()
                                .filter(availability -> { //limit search window
                                    return availability.getStart().toLocalDate().isBefore(windowEnd)
                                            && availability.getStart().plus(availability.getDuration())
                                                           .toLocalDate().isAfter(windowStart);
                                })
                                .map(availabilityMapper::toInterval)
                                .toList();
    }

    /**
     * Project a user's RecurringAvailabilities to a list of AvailabilityIntervals.
     * Each RecurringAvailability is expanded into a list of AvailabilityIntervals
     * within the time window. Intervals are removed or replaced as indicated by
     * the user's AvailabilityExceptions.
     * @return list of AvailabilityIntervals for a user's RecurringAvailabilities
     */
    private List<AvailabilityInterval> projectRecurringsToIntervals(UUID userId,
                                                                    LocalDate windowStart,
                                                                    LocalDate windowEnd) {
        //map exceptions from (source availability ID, exception date) to (exception)
        Map<ExceptionKey, AvailabilityException> exceptionMap =
                exceptionRepository.findAllByUserId(userId).stream().collect(Collectors.toMap(
                        e -> new ExceptionKey(e.getRecurringAvailabilityId(), e.getExceptionDate()),
                        e -> e
                ));

        return recurringRepository.findAllByUserId(userId).stream().flatMap(
                availability ->
                    getRecurringOccurrences(availability, windowStart, windowEnd).stream().map(
                        occurrence -> {
                            //check if this occurrence has an exception
                            ExceptionKey key = new ExceptionKey(availability.getId(),
                                                                occurrence);
                            AvailabilityException exception = exceptionMap.get(key);

                            if (exception == null) { //if no exception, return recurring interval
                                return availabilityMapper.toInterval(availability, occurrence);
                            }
                            if (!exception.isCancelled()) { //if exception is an override, return override
                                return availabilityMapper.toInterval(exception, availability);
                            }
                            return null; //if exception is a cancellation, return null
                        }
                    )
                )
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

    private void verifyNoConflictsOnboarding(UUID userId, AvailabilityOnboardingRequests requests) {

        //project requests to intervals

        Stream<AvailabilityInterval> oneTimes = requests.oneTimes().stream()
                                                        .map(oneTime -> availabilityMapper.toEntity(oneTime, userId))
                                                        .map(availabilityMapper::toInterval);

        Stream<AvailabilityInterval> recurrings = requests.recurringsWithExceptions().stream().flatMap(
                 recWithExc -> {
                     RecurringAvailability recurring = availabilityMapper.toEntity(recWithExc.recurring(), userId);
                     Map<LocalDate, AvailabilityException> exceptionMap =
                             recWithExc.exceptions().stream().collect(Collectors.toMap(
                                     e -> e.exceptionDate(),
                                     e -> availabilityMapper.toEntity(e, userId, null))
                             );

                     return getRecurringOccurrences(recurring, LocalDate.now(), LocalDate.now().plusDays(
                             schedulingWindowDays)).stream().map(
                             occurrence -> {
                                 AvailabilityException exception = exceptionMap.get(occurrence);

                                 if (exception == null) { //if no exception, return recurring interval
                                     return availabilityMapper.toInterval(recurring, occurrence);
                                 }
                                 if (!exception.isCancelled()) { //if exception is an override, return override
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
