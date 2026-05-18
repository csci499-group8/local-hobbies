package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.RecurringAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringAvailabilityRepository extends JpaRepository<RecurringAvailability, UUID> {

    Integer countByUserId(UUID userId);

    List<RecurringAvailability> findAllByUserId(UUID userId);

    @Query("""
        SELECT r FROM RecurringAvailability r
        WHERE r.userId = :userId
        AND (r.ruleEnd IS NULL OR r.ruleEnd > :cutoffDate)
        ORDER BY r.ruleStart
    """)
    List<RecurringAvailability> findActiveByUserId(@Param("userId") UUID userId,
                                                   @Param("cutoffDate") LocalDate cutoffDate);

}
