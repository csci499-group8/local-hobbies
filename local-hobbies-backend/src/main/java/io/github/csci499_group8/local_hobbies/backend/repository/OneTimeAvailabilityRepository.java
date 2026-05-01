package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.OneTimeAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OneTimeAvailabilityRepository extends JpaRepository<OneTimeAvailability, UUID> {

    Integer countByUserId(UUID userId);

    List<OneTimeAvailability> findAllByUserId(UUID userId);

}
