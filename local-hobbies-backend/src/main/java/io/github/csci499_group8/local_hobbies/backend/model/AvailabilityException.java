package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import static io.github.csci499_group8.local_hobbies.backend.config.AvailabilityConstants.MAX_DURATION_HOURS;

@Entity
@Table(name = "availability_exception", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"recurring_availability_id", "exception_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityException implements UserOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "recurring_availability_id", nullable = false)
    private Integer recurringAvailabilityId;

    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    @Column(name = "exception_reason", columnDefinition = "TEXT")
    private String exceptionReason;

    @Column(name = "is_cancelled", nullable = false)
    private boolean isCancelled;

    @Column(name = "override_location", columnDefinition = "geography(Point, 4326)")
    private Point overrideLocation;

    @Column(name = "override_start_time")
    private LocalTime overrideStartTime;

    @JdbcTypeCode(SqlTypes.INTERVAL_SECOND)
    @Column(name = "override_duration")
    @MaxDurationHours(MAX_DURATION_HOURS)
    private Duration overrideDuration;

}
