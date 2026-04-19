package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hobby", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "hobby_name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hobby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    //ORM:
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "hobby_name", nullable = false)
    private String hobbyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", nullable = false)
    private HobbyExperienceLevel experienceLevel;

}
