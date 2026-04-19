package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.dto.match.SavedMatchResponse;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedMatchRepository extends JpaRepository<SavedMatch, Integer> {
    List<SavedMatch> findAllByUserId(Integer userId);

    boolean existsByUserAndSavedUserAndHobbyAndStatus(Integer userId, @NotNull Integer integer, @NotBlank String hobby,
                                                      String status);

    Integer countByUserId(Integer userId);

    boolean existsByUserAndSavedUser(Integer currentUserId, Integer otherUserId);

    Integer countByUserAndStatus(Integer userId, String active);

    boolean existsByUserAndSavedUserAndStatus(Integer currentUserId, Integer otherUserId, String active);

    List<SavedMatchResponse> findAllByUserAndStatus(Integer userId, String active);

    Optional<SavedMatch> findByIdAndStatus(Integer matchId, String active);

}
