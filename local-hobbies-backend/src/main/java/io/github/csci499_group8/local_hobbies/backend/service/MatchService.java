package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.MatchMapper;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchDistanceType;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.repository.SavedMatchRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

import static io.github.csci499_group8.local_hobbies.backend.service.LocationService.calculateDistanceKilometers;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final SavedMatchRepository savedMatchRepository;
    private final MatchMapper matchMapper;
    private final UserService userService;
    private final AvailabilityService availabilityService;

    private record CandidateWithOverlaps(
            User candidate,
            List<AvailabilityOverlapResponse> overlaps
    ) {}

    // --- methods called by MatchController ---

    @Transactional(readOnly = true)
    public List<MatchSearchResultResponse> searchForMatches(Integer userId, MatchSearchRequest request) {
        User currentUser = userService.getUserByIdOrThrow(userId);

        // --- database-level hard filters ---
        Specification<User> hardFilterSpec = UserSpecifications.buildHardFilterSpecification(request, userId);
        List<User> matchCandidates = userService.findUsersBySpecification(hardFilterSpec);

        // --- hard filtering by availability distance and overlap ---

        return matchCandidates.stream().map(candidate -> {
            //find all availability overlaps
            List<AvailabilityOverlapResponse> overlaps =
                    availabilityService.getOverlappingAvailabilities(userId, candidate.getId());
            return new CandidateWithOverlaps(candidate, overlaps);
        }
        ).filter(candidateWithOverlaps -> {
            //return overlaps that pass hard filters
            List<AvailabilityOverlapResponse> overlaps = candidateWithOverlaps.overlaps();

            return overlaps.stream().anyMatch(overlap ->
                overlap.distanceKilometers() <= request.radiusKilometers()
                && Duration.between(overlap.start(), overlap.end()).toMinutes() >= request.minimumOverlapMinutes()
            );
        }
        ).map(matchedUserWithOverlaps -> {
            //calculate MatchSearchResultResponse.distanceKilometers and return response
            Point currentUserLocation = currentUser.getLocationPoint();
            Point matchedUserLocation = matchedUserWithOverlaps.candidate().getLocationPoint();
            double homeDistanceKilometers = calculateDistanceKilometers(currentUserLocation,
                                                                        matchedUserLocation);

            double minOverlapDistanceKilometers = matchedUserWithOverlaps.overlaps().stream()
                                                                         .mapToDouble(AvailabilityOverlapResponse::distanceKilometers)
                                                                         .min() //returns OptionalDouble
                                                                         .orElse(Double.MAX_VALUE);

            MatchDistanceType distanceType = (homeDistanceKilometers < minOverlapDistanceKilometers)
                    ? MatchDistanceType.HOME : MatchDistanceType.NEAREST_OVERLAPPING_AVAILABILITY;
            Double minDistanceKilometers = Math.min(homeDistanceKilometers, minOverlapDistanceKilometers);

            return matchMapper.toSearchResultResponse(matchedUserWithOverlaps.candidate(),
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
            //log forbidden request
            throw new ResourceNotFoundException("Match not found with ID: " + matchId);
        }
        return match;
    }

    private SavedMatchResponse mapToSavedMatchResponse(SavedMatch savedMatch) {
        User savedUser = userService.getUserByIdOrThrow(savedMatch.getSavedUserId());
        return matchMapper.toSavedMatchResponse(savedMatch, savedUser);
    }

}
