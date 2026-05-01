package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.*;
import lombok.*;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_match", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "saved_user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "saved_user_id", nullable = false)
    private UUID savedUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "creation_time", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime creationTime;

    public void softDelete() {
        this.status = MatchStatus.DELETED;
    }

    public void restore() {
        this.status = MatchStatus.ACTIVE;
    }

}
