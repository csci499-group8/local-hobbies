package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Integer> {

    List<AvailabilityException> findAllByUserId(Integer userId);

}
