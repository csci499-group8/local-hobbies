package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.MatchMapper;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.repository.SavedMatchRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.UserSpecifications;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.MutualMatchProjection;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.SavedMatchProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;

import static io.github.csci499_group8.local_hobbies.backend.service.LocationService.calculateDistanceKilometers;

//TODO: add deletionTime field to saved_match table, implement cron job to hard delete matches

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final SavedMatchRepository savedMatchRepository;
    private final MatchMapper matchMapper;
    private final UserService userService;
    private final HobbyService hobbyService;
    private final AvailabilityService availabilityService;
    private final StorageService storageService;

    private record MatchedUserWithOverlaps(
            User matchedUser,
            List<AvailabilityOverlapResponse> overlaps
    ) {}

    // --- methods called by MatchController ---

    @Transactional(readOnly = true)
    public List<MatchSearchResultResponse> searchForMatches(UUID userId, MatchSearchRequest request) {
        User currentUser = userService.getUserByIdOrThrow(userId);

        //database-level hard filters
        Specification<User> hardFilterSpec = UserSpecifications.buildHardFilterSpecification(request, userId);
        List<User> matchCandidates = userService.findUsersBySpecification(hardFilterSpec);

        //hard filtering by availability distance and overlap
        List<MatchedUserWithOverlaps> matches = matchCandidates.stream().map(candidate -> {
            List<AvailabilityOverlapResponse> overlaps = availabilityService
                .getOverlappingAvailabilities(userId, candidate.getId())
                .stream()
                .filter(overlap ->
                            overlap.distanceKilometers() <= request.radiusKilometers()
                                && Duration.between(overlap.start(), overlap.end()).toMinutes() >= request.minimumOverlapMinutes()
                ).toList();

            return new MatchedUserWithOverlaps(candidate, overlaps);
        }).filter(
                match -> !match.overlaps().isEmpty()
        ).toList();

        //get URLs for matches' profile photos
        Map<String, String> matchProfilePhotoKeyToUrl =
                getBatchProfilePhotoUrls(matches.stream()
                                                .map(MatchedUserWithOverlaps::matchedUser)
                                                .toList());

        //calculate MatchSearchResultResponse.distanceKilometers and return response
        return matches.stream().map(matchedUserWithOverlaps -> {
            Point currentUserLocation = currentUser.getLocationPoint();
            Point matchedUserLocation = matchedUserWithOverlaps.matchedUser().getLocationPoint();
            double homeDistanceKilometers = calculateDistanceKilometers(currentUserLocation,
                                                                        matchedUserLocation);

            double minOverlapDistanceKilometers = matchedUserWithOverlaps.overlaps().stream()
                                                                         .mapToDouble(AvailabilityOverlapResponse::distanceKilometers)
                                                                         .min() //returns OptionalDouble
                                                                         .orElse(Double.MAX_VALUE);

            MatchSearchResultResponse.MatchDistanceType distanceType = (homeDistanceKilometers < minOverlapDistanceKilometers)
                    ? MatchSearchResultResponse.MatchDistanceType.HOME
                    : MatchSearchResultResponse.MatchDistanceType.NEAREST_OVERLAPPING_AVAILABILITY;
            Double minDistanceKilometers = Math.min(homeDistanceKilometers, minOverlapDistanceKilometers);

            return matchMapper.toSearchResultResponse(matchedUserWithOverlaps.matchedUser(),
                                                      matchProfilePhotoKeyToUrl.get(matchedUserWithOverlaps.matchedUser.getProfilePhotoKey()),
                                                      distanceType,
                                                      minDistanceKilometers,
                                                      matchedUserWithOverlaps.overlaps());
        }
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getSavedMatches(UUID userId) {
        return mapBatchProjectionsToSavedMatchResponses(
                savedMatchRepository.findAllByUserIdAndStatus(userId, MatchStatus.ACTIVE)
        );
    }

    @Transactional
    public SavedMatchResponse createSavedMatch(UUID userId, SavedMatchCreationRequest request) {
        if (savedMatchRepository.existsByUserIdAndSavedUserIdAndStatus(userId, request.savedUserId(),
                                                                                   MatchStatus.ACTIVE)) {
            throw new IllegalStateException("Saved match already exists");
        }

        SavedMatch match = matchMapper.toEntity(request, userId);
        return mapMatchToSavedMatchResponse(savedMatchRepository.saveAndFlush(match)); //sync creationTime in
    }

    @Transactional
    public SavedMatchResponse updateSavedMatch(UUID userId, UUID matchId,
                                               SavedMatchUpdateRequest request) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.ACTIVE);

        matchMapper.updateEntity(request, match);
        return mapMatchToSavedMatchResponse(savedMatchRepository.save(match));
    }

    //soft deletion; database will permanently delete if not restored within some time period
    @Transactional
    public void deleteSavedMatch(UUID userId, UUID matchId) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.ACTIVE);

        match.softDelete();
        savedMatchRepository.save(match);
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getDeletedSavedMatches(UUID userId) {
        return mapBatchProjectionsToSavedMatchResponses(
                savedMatchRepository.findAllByUserIdAndStatus(userId, MatchStatus.DELETED)
        );
    }

    @Transactional
    public SavedMatchResponse restoreSavedMatch(UUID userId, UUID matchId) {
        SavedMatch match = findMatchByUserIdAndIdAndStatus(userId, matchId, MatchStatus.DELETED);

        match.restore();
        return mapMatchToSavedMatchResponse(savedMatchRepository.save(match));
    }

    @Transactional(readOnly = true)
    public List<MutualMatchResponse> getMutualMatches(UUID userId) {
        List<MutualMatchProjection> projections = savedMatchRepository.findAllMutualMatchProjections(userId);

        Map<String, String> profilePhotoKeyToUrl =
                getBatchProfilePhotoUrls(projections.stream().map(MutualMatchProjection::getSavedUser).toList());

        return projections.stream().map(
                projection -> {
                    User savedUser = projection.getSavedUser();

                    List<HobbyOverlapResponse> overlappingHobbies =
                            hobbyService.getOverlappingHobbies(userId, savedUser.getId());

                    return matchMapper.toMutualMatchResponse(projection,
                                                             profilePhotoKeyToUrl.get(savedUser.getProfilePhotoKey()),
                                                             overlappingHobbies);
                }).toList();
    }

    // --- private helper methods ---

    /**
     * Return saved match if it exists, it is in the expected state, and the request
     * is authorized. Log unauthorized requests.
     * @throws ResourceNotFoundException if match does not exist, match is not in
     *                                   expected state, or request is unauthorized
     */
    private SavedMatch findMatchByUserIdAndIdAndStatus(UUID userId, UUID matchId, MatchStatus status) {
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

    //for singular SavedMatches
    private SavedMatchResponse mapMatchToSavedMatchResponse(SavedMatch savedMatch) {
        User savedUser = userService.getUserByIdOrThrow(savedMatch.getSavedUserId());
        String savedUserProfilePhotoUrl = getProfilePhotoUrl(savedUser.getProfilePhotoKey());

        List<HobbyOverlapResponse> overlappingHobbies = hobbyService.getOverlappingHobbies(savedMatch.getUserId(),
                                                                                           savedMatch.getSavedUserId());

        return matchMapper.toSavedMatchResponse(savedMatch, savedUser, savedUserProfilePhotoUrl, overlappingHobbies);
    }

    //for batch-fetched SavedMatches, for which fetching savedUser is bundled into the call
    private List<SavedMatchResponse> mapBatchProjectionsToSavedMatchResponses(List<SavedMatchProjection> savedMatchProjections) {
        Map<String, String> profilePhotoKeyToUrl =
                getBatchProfilePhotoUrls(savedMatchProjections.stream().map(SavedMatchProjection::getSavedUser).toList());

        return savedMatchProjections.stream().map(
                projection -> {
                    String profilePhotoUrl = profilePhotoKeyToUrl.get(projection.getSavedUser().getProfilePhotoKey());

                    List<HobbyOverlapResponse> overlappingHobbies =
                            hobbyService.getOverlappingHobbies(projection.getSavedMatch().getUserId(),
                                                               projection.getSavedMatch().getSavedUserId());

                    return matchMapper.toSavedMatchResponse(projection, profilePhotoUrl, overlappingHobbies);
                }
        ).toList();
    }

    private String getProfilePhotoUrl(String objectKey) {
        if (objectKey == null) return null;

        return storageService.createPresignedGetUrl(objectKey);
    }

    private Map<String, String> getBatchProfilePhotoUrls(List<User> matchedUsers) {
        List<String> keys = matchedUsers.stream()
                                        .map(User::getProfilePhotoKey)
                                        .toList();

        return (!keys.isEmpty())
                ? storageService.createBatchPresignedGetUrls(keys)
                : Collections.emptyMap();
    }

}
