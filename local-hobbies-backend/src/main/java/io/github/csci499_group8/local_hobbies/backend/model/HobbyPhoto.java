package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hobby_photo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HobbyPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "hobby_id", nullable = false)
    private Integer hobbyId;

    @Column(name = "photo_url", nullable = false, columnDefinition = "TEXT")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String caption;

}
