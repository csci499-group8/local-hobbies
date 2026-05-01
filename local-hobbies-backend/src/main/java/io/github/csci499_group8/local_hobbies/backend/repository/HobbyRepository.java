package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, UUID> {

    //inherited from JpaRepository:
//    Hobby save(Hobby hobby);
//    List<Hobby> saveAll(List<Hobby> hobbies);
//    void delete(Hobby hobby);
//    Optional<Hobby> findById(UUID hobbyId);

    List<Hobby> findAllByUserId(UUID userId);

    Integer countByUserId(UUID userId);

    @Query("""
        SELECT new io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse(
            h1.name,
            h1.experienceLevel,
            h2.experienceLevel
        )
        FROM Hobby h1
        JOIN Hobby h2 ON h1.name = h2.name
        WHERE h1.userId = :currentUserId
          AND h2.userId = :otherUserId
    """)
    List<HobbyOverlapResponse> findOverlappingHobbies(@Param("currentUserId") UUID currentUserId,
                                                      @Param("otherUserId") UUID otherUserId);

    boolean existsByUserIdAndName(UUID userId, HobbyName name);

}
