package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedMatchRepository extends JpaRepository<SavedMatch, Integer> {

    Optional<SavedMatch> findByIdAndStatus(Integer matchId, MatchStatus status);

    Integer countByUserIdAndStatus(Integer userId, MatchStatus status);

    List<SavedMatch> findAllByUserIdAndStatus(Integer userId, MatchStatus status);

    boolean existsByUserIdAndSavedUserIdAndStatus(Integer currentUserId, Integer otherUserId,
                                                  MatchStatus status);

    boolean existsByUserIdAndSavedUserIdAndHobbyNameAndStatus(Integer userId, Integer integer,
                                                              HobbyName hobby, MatchStatus status);

}
