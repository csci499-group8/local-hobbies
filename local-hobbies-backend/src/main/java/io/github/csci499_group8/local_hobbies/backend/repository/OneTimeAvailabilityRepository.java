package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OneTimeAvailabilityRepository extends JpaRepository<OneTimeAvailability, Integer> {
    Integer countByUserId(Integer userId);

    List<OneTimeAvailability> findAllByUserId(Integer userId);
}
