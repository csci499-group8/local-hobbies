package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.HobbyPhotoProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

//use manual queries with projections when performing batch fetches of multi-table data

@Repository
public interface HobbyPhotoRepository extends JpaRepository<HobbyPhoto, UUID> {

    @Query("""
        SELECT
            hp as hobbyPhoto,
            h.name as hobbyName
        FROM HobbyPhoto hp
        JOIN Hobby h ON hp.hobbyId = h.id
        WHERE h.userId = :userId
    """)
    List<HobbyPhotoProjection> findAllByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT
            hp as hobbyPhoto,
            h.name as hobbyName
        FROM HobbyPhoto hp
        JOIN Hobby h ON hp.hobbyId = h.id
        WHERE h.id = :hobbyId
    """)
    List<HobbyPhotoProjection> findAllByHobbyId(UUID hobbyId);

}
