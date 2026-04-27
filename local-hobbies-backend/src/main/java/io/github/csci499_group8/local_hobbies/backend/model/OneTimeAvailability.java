package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.validation.MaxDurationHours;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.time.Duration;
import java.time.OffsetDateTime;

@Entity
@Table(name = "one_time_availability", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "start", "duration"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OneTimeAvailability implements UserOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Getter
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(nullable = false)
    private OffsetDateTime start;

    @JdbcTypeCode(SqlTypes.INTERVAL_SECOND)
    @Column(nullable = false)
    @MaxDurationHours
    private Duration duration;

}
