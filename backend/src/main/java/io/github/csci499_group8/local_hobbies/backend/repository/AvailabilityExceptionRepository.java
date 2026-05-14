package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, UUID> {

    List<AvailabilityException> findAllByUserId(UUID userId);

    boolean existsByExceptionDateAndRecurringAvailabilityId(LocalDate exceptionDate,
                                                            UUID recurringAvailabilityId);

    void deleteByRecurringAvailabilityId(UUID recurringAvailabilityId);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE FROM AvailabilityException e
        WHERE e.recurringAvailabilityId = :recurringAvailabilityId
        AND (e.exceptionDate < :ruleStart OR e.exceptionDate > :ruleEnd)
    """)
    void deleteByRecurringAvailabilityIdAndExceptionDateOutsideRange(@Param("recurringAvailabilityId") UUID recurringAvailabilityId,
                                                                     @Param("ruleStart") LocalDate ruleStart,
                                                                     @Param("ruleEnd") LocalDate ruleEnd);

}
