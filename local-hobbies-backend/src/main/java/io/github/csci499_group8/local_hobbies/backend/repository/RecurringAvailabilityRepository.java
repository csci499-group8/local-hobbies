package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringAvailabilityRepository extends JpaRepository<RecurringAvailability, UUID> {

//    Optional<RecurringAvailability> findById(UUID id);

    Integer countByUserId(UUID userId);

    List<RecurringAvailability> findAllByUserId(UUID userId);

}
