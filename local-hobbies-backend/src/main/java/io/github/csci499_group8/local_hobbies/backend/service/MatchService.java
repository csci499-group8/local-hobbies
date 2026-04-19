package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.MatchMapper;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.repository.SavedMatchRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

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
        // --- database-level hard filters ---
        Specification<User> hardFilterSpec = UserSpecifications.buildHardFilterSpecification(request, userId);
        List<User> matchCandidates = userService.findUsersBySpecification(hardFilterSpec);

        // --- hard filtering by availability distance and overlap ---

        return matchCandidates.stream().map(candidate -> {
            List<AvailabilityOverlapResponse> overlaps =
                    availabilityService.getOverlappingAvailabilities(userId, candidate.getId());
            return new CandidateWithOverlaps(candidate, overlaps);
        }
        ).filter(candidateWithOverlaps -> {
            List<AvailabilityOverlapResponse> overlaps = candidateWithOverlaps.overlaps();

            return overlaps.stream().anyMatch(overlap ->
                overlap.distanceKilometers() <= request.radiusKilometers()
                && Duration.between(overlap.start(), overlap.end()).toMinutes() >= request.minimumOverlapMinutes()
            );
        }
        ).map(matchedUserWithOverlaps -> {
            return matchMapper.toResponse(matchedUserWithOverlaps.candidate(),
                                          matchedUserWithOverlaps.overlaps());
        }
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getSavedMatches(Integer userId) {
        return savedMatchRepository.findAllByUserAndStatus(userId, "Active");
    }

    @Transactional
    public SavedMatchResponse saveMatch(Integer userId, SavedMatchCreationRequest request) {
        if (savedMatchRepository.existsByUserAndSavedUserAndHobbyAndStatus(userId, request.savedUserId(),
                                                                           request.hobby(), "Active")) {
            throw new IllegalStateException("Saved match already exists");
        }

        SavedMatch match = matchMapper.toEntity(request, userId);
        return matchMapper.toResponse(savedMatchRepository.save(match));
    }

    @Transactional
    public SavedMatchResponse updateSavedMatch(Integer userId, Integer matchId,
                                               SavedMatchUpdateRequest request) {
        SavedMatch match = findMatchByUserAndId(userId, matchId, "Active");

        matchMapper.updateEntity(request, match);
        return matchMapper.toResponse(savedMatchRepository.save(match));
    }

    //soft deletion; database will permanently delete if not restored within some time period
    @Transactional
    public void deleteSavedMatch(Integer userId, Integer matchId) {
        SavedMatch match = findMatchByUserAndId(userId, matchId, "Active");

        match.softDelete();
        savedMatchRepository.save(match);
    }

    @Transactional(readOnly = true)
    public List<SavedMatchResponse> getDeletedSavedMatches(Integer userId) {
        return savedMatchRepository.findAllByUserAndStatus(userId, "Deleted");
    }

    @Transactional
    public SavedMatchResponse restoreSavedMatch(Integer userId, Integer matchId) {
        SavedMatch match = findMatchByUserAndId(userId, matchId, "Deleted");

        match.restore();
        return matchMapper.toResponse(savedMatchRepository.save(match));
    }

    // --- methods called by services ---

    @Transactional(readOnly = true)
    public Integer getMatchCount(Integer userId) {
        return savedMatchRepository.countByUserAndStatus(userId, "Active");
    }

    @Transactional(readOnly = true)
    public boolean isSavedMatch(Integer currentUserId, Integer otherUserId) {
        return savedMatchRepository
                .existsByUserAndSavedUserAndStatus(currentUserId, otherUserId, "Active");
    }

    // --- private helper methods ---

    /**
     * Return saved match if it exists, it is in the expected state, and the request
     * is authorized. Log unauthorized requests.
     * @throws ResourceNotFoundException if match does not exist, match is not in
     *                                   expected state, or request is unauthorized
     */
    private SavedMatch findMatchByUserAndId(Integer userId, Integer matchId, String status) {
        SavedMatch match = savedMatchRepository.findByIdAndStatus(matchId, status).orElseThrow(
                () -> new ResourceNotFoundException("Match not found with ID: " + matchId));

        //verify ownership
        if (!match.getUserId().equals(userId)) {
            //log forbidden request
            throw new ResourceNotFoundException("Match not found with ID: " + matchId);
        }
        return match;
    }

}
