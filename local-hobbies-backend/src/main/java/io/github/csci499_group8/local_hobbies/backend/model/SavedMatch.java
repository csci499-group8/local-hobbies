package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.*;
import lombok.*;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;

import java.time.OffsetDateTime;

@Entity
@Table(name = "saved_match", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "saved_user_id", "hobby_name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "saved_user_id", nullable = false)
    private Integer savedUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(name = "hobby_name", nullable = false)
    private String hobbyName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "creation_time", nullable = false)
    private OffsetDateTime creationTime;

    public void softDelete() {
        this.status = MatchStatus.DELETED;
    }

    public void restore() {
        this.status = MatchStatus.ACTIVE;
    }

}
