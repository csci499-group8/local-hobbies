package io.github.csci499_group8.local_hobbies.backend.repository;

import io.github.csci499_group8.local_hobbies.backend.model.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Integer> {

    List<AvailabilityException> findAllByUserId(Integer userId);

    boolean existsByExceptionDateAndRecurringAvailabilityId(LocalDate exceptionDate,
                                                            Integer recurringAvailabilityId);

    void deleteByRecurringAvailabilityId(Integer recurringAvailabilityId);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE FROM AvailabilityException e
        WHERE e.recurringAvailabilityId = :recurringAvailabilityId
        AND (e.exceptionDate < :ruleStart OR e.exceptionDate > :ruleEnd)
    """)
    void deleteByRecurringAvailabilityIdAndExceptionDateOutsideRange(Integer recurringAvailabilityId,
                                                                     LocalDate ruleStart, LocalDate ruleEnd);

}
