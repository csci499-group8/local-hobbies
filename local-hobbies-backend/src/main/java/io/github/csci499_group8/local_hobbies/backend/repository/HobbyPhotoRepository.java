package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HobbyPhotoRepository extends JpaRepository<HobbyPhoto, Integer> {

    @Query("""
        SELECT hp FROM HobbyPhoto hp
        JOIN Hobby h ON hp.hobbyId = h.id
        WHERE h.userId = :userId
    """)
    List<HobbyPhoto> findAllByUserId(Integer userId);

}
