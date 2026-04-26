package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.MatchMapper;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.repository.SavedMatchRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.UserSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;

import static io.github.csci499_group8.local_hobbies.backend.service.LocationService.calculateDistanceKilometers;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final SavedMatchRepository savedMatchRepository;
    private final MatchMapper matchMapper;
    private final UserService userService;
    private final AvailabilityService availabilityService;

    private record MatchedUserWithOverlaps(
            User matchedUser,
            List<AvailabilityOverlapResponse> overlaps
    ) {}

    // --- methods called by MatchController ---

    @Transactional(readOnly = true)
    public List<MatchSearchResultResponse> searchForMatches(Integer userId, MatchSearchRequest request) {
        User currentUser = userService.getUserByIdOrThrow(userId);

        //database-level hard filters
        Specification<User> hardFilterSpec = UserSpecifications.buildHardFilterSpecification(request, userId);
        List<User> matchCandidates = userService.findUsersBySpecification(hardFilterSpec);

        //hard filtering by availability distance and overlap
        Stream<MatchedUserWithOverlaps> matches = matchCandidates.stream().map(candidate -> {
            List<AvailabilityOverlapResponse> overlaps = availabilityService
                .getOverlappingAvailabilities(userId, candidate.getId())
                .stream()
                .filter(overlap ->
                            overlap.distanceKilometers() <= request.radiusKilometers()
                                && Duration.between(overlap.start(), overlap.end()).toMinutes() >= request.minimumOverlapMinutes()
                ).toList();

            return new MatchedUserWithOverlaps(candidate, overlaps);
        });

        //calculate MatchSearchResultResponse.distanceKilometers and return response
        return matches.map(matchedUserWithOverlaps -> {
            Point currentUserLocation = currentUser.getLocationPoint();
            Point matchedUserLocation = matchedUserWithOverlaps.matchedUser().getLocationPoint();
            double homeDistanceKilometers = calculateDistanceKilometers(currentUserLocation,
                                                                        matchedUserLocation);

            double minOverlapDistanceKilometers = matchedUserWithOverlaps.overlaps().stream()
                                                                         .mapToDouble(AvailabilityOverlapResponse::distanceKilometers)
                                                                         .min() //returns OptionalDouble
                                                                         .orElse(Double.MAX_VALUE);

            MatchSearchResultResponse.MatchDistanceType distanceType = (homeDistanceKilometers < minOverlapDistanceKilometers)
                    ? MatchSearchResultResponse.MatchDistanceType.HOME : MatchSearchResultResponse.MatchDistanceType.NEAREST_OVERLAPPING_AVAILABILITY;
            Double minDistanceKilometers = Math.min(homeDistanceKilometers, minOverlapDistanceKilometers);

            return matchMapper.toSearchResultResponse(matchedUserWithOverlaps.matchedUser(),
                                                      distanceType,
                                                      minDistanceKilometers,
                                                      matchedUserWithOverlaps.overlaps());
        }
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getSavedMatches(Integer userId) {
        return savedMatchRepository.findAllByUserIdAndStatus(userId, MatchStatus.ACTIVE).stream()
                                   .map(this::mapToSavedMatchResponse)
                                   .toList();
    }

    @Transactional
    public SavedMatchResponse createSavedMatch(Integer userId, SavedMatchCreationRequest request) {
        if (savedMatchRepository.existsByUserIdAndSavedUserIdAndHobbyNameAndStatus(userId, request.savedUserId(),
                                                                                   request.hobby(), MatchStatus.ACTIVE)) {
            throw new IllegalStateException("Saved match already exists");
        }

        SavedMatch match = matchMapper.toEntity(request, userId);
        return mapToSavedMatchResponse(savedMatchRepository.save(match));
    }

    @Transactional
    public SavedMatchResponse updateSavedMatch(Integer userId, Integer matchId,
                                               SavedMatchUpdateRequest request) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.ACTIVE);

        matchMapper.updateEntity(request, match);
        return mapToSavedMatchResponse(savedMatchRepository.save(match));
    }

    //soft deletion; database will permanently delete if not restored within some time period
    @Transactional
    public void deleteSavedMatch(Integer userId, Integer matchId) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.ACTIVE);

        match.softDelete();
        savedMatchRepository.save(match);
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getDeletedSavedMatches(Integer userId) {
        return savedMatchRepository.findAllByUserIdAndStatus(userId, MatchStatus.DELETED).stream()
                                   .map(this::mapToSavedMatchResponse)
                                   .toList();
    }

    @Transactional
    public SavedMatchResponse restoreSavedMatch(Integer userId, Integer matchId) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.DELETED);

        match.restore();
        return mapToSavedMatchResponse(savedMatchRepository.save(match));
    }

    // --- private helper methods ---

    /**
     * Return saved match if it exists, it is in the expected state, and the request
     * is authorized. Log unauthorized requests.
     * @throws ResourceNotFoundException if match does not exist, match is not in
     *                                   expected state, or request is unauthorized
     */
    private SavedMatch findMatchByUserIdAndIdAndStatus(Integer userId, Integer matchId, MatchStatus status) {
        SavedMatch match = savedMatchRepository.findByIdAndStatus(matchId, status).orElseThrow(
                () -> new ResourceNotFoundException("Match not found with ID: " + matchId));

        //verify ownership
        if (!match.getUserId().equals(userId)) {
            log.warn("Unauthorized access attempt: User {} tried to access saved match {} owned by user {}",
                     userId, matchId, match.getUserId());

            throw new ResourceNotFoundException("Match not found with ID: " + matchId);
        }
        return match;
    }

    private SavedMatchResponse mapToSavedMatchResponse(SavedMatch savedMatch) {
        User savedUser = userService.getUserByIdOrThrow(savedMatch.getSavedUserId());
        return matchMapper.toSavedMatchResponse(savedMatch, savedUser);
    }

}
