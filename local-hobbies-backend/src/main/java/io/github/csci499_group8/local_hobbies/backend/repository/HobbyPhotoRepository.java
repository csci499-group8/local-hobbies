package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface HobbyPhotoRepository extends JpaRepository<HobbyPhoto, Integer> {
    Collection<HobbyPhoto> findAllByUserId(Integer userId);
}
