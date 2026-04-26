package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyCategory;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_hobby")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalHobby {

    @Id
    @Enumerated(EnumType.STRING)
    private HobbyName name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HobbyCategory category;

}
