package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HobbyRepository extends JpaRepository<Hobby, Integer> {

    //inherited from JpaRepository:
//    Hobby save(Hobby hobby);
//    List<Hobby> saveAll(List<Hobby> hobbies);
//    void delete(Hobby hobby);
//    Optional<Hobby> findById(Integer hobbyId);

    List<Hobby> findAllByUserId(Integer userId);

    Integer countByUserId(Integer userId);

    @Query("""
        SELECT new io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse(h1.hobbyName)
        FROM Hobby h1
        JOIN Hobby h2 ON h1.hobbyName = h2.hobbyName
        WHERE h1.userId = :currentUserId
          AND h2.userId = :otherUserId
    """)
    List<HobbyOverlapResponse> findOverlappingHobbies(@Param("currentUserId") Integer currentUserId,
                                                      @Param("otherUserId") Integer otherUserId);

    boolean existsByUserIdAndHobbyName(Integer userId, String name);

}
