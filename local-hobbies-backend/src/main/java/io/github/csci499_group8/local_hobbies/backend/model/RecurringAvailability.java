package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.model.enums.AvailabilityFrequency;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.time.*;

@Entity
@Table(name = "recurring_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringAvailability implements UserOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(name = "rule_start", nullable = false)
    private LocalDate ruleStart;

    @Column(name = "rule_end")
    private LocalDate ruleEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityFrequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "start_day_of_week")
    private DayOfWeek startDayOfWeek;

    @Column(name = "start_day_of_month")
    private Integer startDayOfMonth;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @JdbcTypeCode(SqlTypes.INTERVAL_SECOND)
    @Column(nullable = false)
    @MaxDurationHours
    private Duration duration;

    @Column(name = "time_zone_id", nullable = false, length = 64)
    private String timeZoneId;

}
