package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.MatchMapper;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
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
import java.time.LocalDate;
import java.time.Period;
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

    private record ScoredResult(
        double score, 
        MatchSearchResultResponse result
    ) {}

    // --- methods called by MatchController ---

    /**
     * Find matches that fit hard filters. Sort results by match score, which takes into account soft filters.
     */
    @Transactional(readOnly = true)
    public List<MatchSearchResultResponse> searchForMatches(UUID currentUserId, MatchSearchRequest request) {
        User currentUser = userService.getUserByIdOrThrow(currentUserId);

        //database-level hard filters
        Specification<User> hardFilterSpec = UserSpecifications.buildHardFilterSpecification(request, currentUserId);
        List<User> matchCandidates = userService.findUsersBySpecification(hardFilterSpec);

        //hard filtering by availability distance and overlap
        List<MatchedUserWithOverlaps> matches = matchCandidates.stream().map(candidate -> {
            List<AvailabilityOverlapResponse> overlaps = availabilityService
                .getOverlappingAvailabilities(currentUserId, candidate.getId())
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

        //get set of IDs of all users who have saved current user
        Set<UUID> userIdsOfInboundMatches = savedMatchRepository.findAllUserIdsOfInboundMatches(currentUserId);

        //get map of every matched user's experience level for the searched hobby
        Map<UUID, HobbyExperienceLevel> experienceLevels =
                hobbyService.getExperienceLevelsOfMatchCandidates(matches.stream().map(m -> m.matchedUser().getId()).toList(),
                                                                  request.hobby());

        //assemble and score responses, and sort by descending score
        return matches.stream().map(matchedUserWithOverlaps -> {
            //calculate MatchSearchResultResponse.distanceKilometers

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
            double minDistanceKilometers = Math.min(homeDistanceKilometers, minOverlapDistanceKilometers);

            //get other match result fields

            String profilePhotoUrl = matchProfilePhotoKeyToUrl.get(matchedUserWithOverlaps.matchedUser.getProfilePhotoKey());
            boolean hasSavedCurrentUser = userIdsOfInboundMatches.contains(matchedUserWithOverlaps.matchedUser.getId());

            //score match
            double score = scoreMatch(matchedUserWithOverlaps.matchedUser(), 
                                      request,
                                      hasSavedCurrentUser, 
                                      minDistanceKilometers,
                                      experienceLevels.get(matchedUserWithOverlaps.matchedUser.getId()), 
                                      matchedUserWithOverlaps.overlaps());

            return new ScoredResult(score, matchMapper.toSearchResultResponse(
                    matchedUserWithOverlaps.matchedUser(),
                    profilePhotoUrl,
                    hasSavedCurrentUser,
                    distanceType,
                    minDistanceKilometers,
                    matchedUserWithOverlaps.overlaps()));
        })
        .sorted(Comparator.comparingDouble(ScoredResult::score).reversed())
        .map(ScoredResult::result)
        .toList();
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getSavedMatches(UUID userId) {
        return mapBatchProjectionsToSavedMatchResponses(
                savedMatchRepository.findAllByUserIdAndStatus(userId, MatchStatus.ACTIVE)
        );
    }

    @Transactional
    public SavedMatchResponse createSavedMatch(UUID userId, SavedMatchCreationRequest request) {
        Optional<SavedMatch> existingMatchOpt = savedMatchRepository.findByUserIdAndSavedUserId(userId, request.savedUserId());

        if (existingMatchOpt.isPresent()) {
            SavedMatch existingMatch = existingMatchOpt.get();

            if (existingMatch.getStatus() == MatchStatus.ACTIVE) {
                throw new IllegalStateException("Saved match already exists");
            }

            if (existingMatch.getStatus() == MatchStatus.DELETED) {
                existingMatch.restore();
                return mapMatchToSavedMatchResponse(savedMatchRepository.save(existingMatch));
            }

            //in case future statuses are added
            throw new IllegalStateException("Unhandled match status state: " + existingMatch.getStatus());
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
     * Compute a relevance score for a match candidate (higher = more relevant).
     * Scoring breakdown (max 100):
     * <ul>
     *   <li>35 pts — distance: linearly decaying bonus from 0 km (max pts) to radiusKm (0 pts)</li>
     *   <li>30 pts — total overlap duration: linearly increasing bonus capped at 480 min (8 h)</li>
     *   <li>15 pts — inbound match: flat bonus when candidate has already saved current user</li>
     *   <li>24 pts — soft filter satisfaction: partial points per matched soft filter</li>
     * </ul>
     */
    private double scoreMatch(User match,
                              MatchSearchRequest request,
                              boolean hasSavedCurrentUser,
                              double minDistanceKilometers,
                              HobbyExperienceLevel experienceLevel,
                              List<AvailabilityOverlapResponse> overlaps) {
        double score = 0.0;

        // distance score (35 pts)
        double distanceRatio = request.radiusKilometers() == 0 //guard against (probably impossible) divide-by-zero error
                ? 0.0
                : Math.min(minDistanceKilometers / request.radiusKilometers(), 1.0);
        score += 35.0 * (1.0 - distanceRatio);

        // overlap duration score (30 pts, capped at 480 min / 8 h)
        double totalOverlapMinutes = overlaps.stream()
                .mapToLong(o -> Duration.between(o.start(), o.end()).toMinutes())
                .sum();
        score += 30.0 * Math.min(totalOverlapMinutes / 480.0, 1.0);

        // inbound match bonus (15 pts)
        if (hasSavedCurrentUser) score += 15.0;

        // soft filter bonus (24 pts max)
        int age = Period.between(match.getBirthDate(), LocalDate.now()).getYears();
        UserGenderMatched gender = match.getGenderMatched();

        for (MatchSearchRequest.MatchSearchFilter filter : request.filters()) {
            if (filter.isHard()) continue; // hard filters already enforced; no bonus
            score += switch (filter) {
                case MatchSearchRequest.GendersFilter gf ->
                    gf.genders().contains(gender) ? 6.0 : 0.0;
                case MatchSearchRequest.MinAgeFilter mf ->
                    age >= mf.minAge() ? 6.0 : 0.0;
                case MatchSearchRequest.MaxAgeFilter mf ->
                    age <= mf.maxAge() ? 6.0 : 0.0;
                case MatchSearchRequest.ExperienceLevelFilter ef ->
                    ef.experienceLevel().equals(experienceLevel) ? 6.0 : 0.0;
            };
        }

        return score;
    }


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
