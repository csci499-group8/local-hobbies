package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.MutualMatchProjection;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.SavedMatchProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

//TODO: if codebase gets refactored to use JPA's ORM, change manual queries to use JOIN FETCH on saved users
//use manual queries with projections when performing batch fetches of multi-table data

@Repository
public interface SavedMatchRepository extends JpaRepository<SavedMatch, UUID> {

    //only some methods that call this would benefit from receiving SavedMatchProjection,
    //so it just returns SavedMatch
    Optional<SavedMatch> findByIdAndStatus(UUID matchId, MatchStatus status);

    Optional<SavedMatch> findByUserIdAndSavedUserId(UUID userId, UUID savedUserId);

    Integer countBySavedUserIdAndStatus(UUID userId, MatchStatus status);

    boolean existsByUserIdAndSavedUserIdAndStatus(UUID currentUserId,
                                                  UUID otherUserId,
                                                  MatchStatus status);

    @Query("""
        SELECT save.userId from SavedMatch save
        WHERE save.savedUserId = :currentUserId
        AND save.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
    """)
    Set<UUID> findAllUserIdsOfInboundMatches(@Param("currentUserId") UUID currentUserId);

    @Query("""
        SELECT
            save as savedMatch,
            u as savedUser
        FROM SavedMatch save
        JOIN User u ON save.savedUserId = u.id
        WHERE save.userId = :userId AND save.status = :status
    """)
    List<SavedMatchProjection> findAllByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") MatchStatus status);

    @Query("""
        SELECT
            currentUserSave as currentUserSavedMatch,
            otherUser as savedUser,
            CASE WHEN currentUserSave.creationTime > otherUserSave.creationTime THEN currentUserSave.creationTime ELSE otherUserSave.creationTime END as mutualMatchTime
        FROM SavedMatch currentUserSave
        JOIN User otherUser ON currentUserSave.savedUserId = otherUser.id
        JOIN SavedMatch otherUserSave ON otherUser.id = otherUserSave.userId
                                      AND currentUserSave.userId = otherUserSave.savedUserId
        WHERE currentUserSave.userId = :currentUserId
        AND currentUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
        AND otherUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
        ORDER BY mutualMatchTime DESC
    """)
    List<MutualMatchProjection> findAllMutualMatchProjections(@Param("currentUserId") UUID currentUserId);

    @Query("""
    SELECT COUNT(currentUserSave)
    FROM SavedMatch currentUserSave
    JOIN SavedMatch otherUserSave
        ON currentUserSave.savedUserId = otherUserSave.userId
        AND currentUserSave.userId = otherUserSave.savedUserId
    WHERE currentUserSave.userId = :currentUserId
    AND currentUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
    AND otherUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
    """)
    int countMutualMatches(@Param("currentUserId") UUID currentUserId);

    @Query("""
    SELECT CASE WHEN COUNT(currentUserSave) > 0 THEN true ELSE false END
    FROM SavedMatch currentUserSave
    JOIN SavedMatch otherUserSave
        ON currentUserSave.savedUserId = otherUserSave.userId
        AND currentUserSave.userId = otherUserSave.savedUserId
    WHERE currentUserSave.userId = :currentUserId
    AND currentUserSave.savedUserId = :otherUserId
    AND currentUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
    AND otherUserSave.status = io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus.ACTIVE
    """)
    boolean isMutualMatch(@Param("currentUserId") UUID currentUserId,
                          @Param("otherUserId") UUID otherUserId);

}
