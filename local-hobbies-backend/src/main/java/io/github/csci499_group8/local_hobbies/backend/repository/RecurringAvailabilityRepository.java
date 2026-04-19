package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringAvailabilityRepository extends JpaRepository<RecurringAvailability, Integer> {

//    Optional<RecurringAvailability> findById(Integer id);

    Integer countByUserId(Integer userId);

    List<RecurringAvailability> findAllByUserId(Integer userId);

}
