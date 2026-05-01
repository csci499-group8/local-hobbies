package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "hobby_photo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HobbyPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "hobby_id", nullable = false)
    private UUID hobbyId;

    @Column(name = "photo_key", nullable = false, columnDefinition = "TEXT")
    private String photoKey;

    @Column(columnDefinition = "TEXT")
    private String caption;

}
