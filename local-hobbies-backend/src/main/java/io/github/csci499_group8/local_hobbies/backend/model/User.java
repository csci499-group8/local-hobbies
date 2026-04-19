package io.github.csci499_group8.local_hobbies.backend.model;

import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 40)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false, length = 254)
    private String email;

    @Column(name = "last_session_time", nullable = false)
    private OffsetDateTime lastSessionTime;

    @Column(name = "onboarding_complete", nullable = false)
    private boolean onboardingComplete = false;

    private String name;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "gender_displayed")
    private String genderDisplayed;

    @Column(columnDefinition = "TEXT") //explicitly stated to override default VARCHAR(255)
    private String bio;

    @Column(name = "location_point", columnDefinition = "geography(Point, 4326)")
    private Point locationPoint;

    @Column(name = "location_approximate")
    private String locationApproximate;

    @Column(name = "public_contact_info")
    private String publicContactInfo;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_matched")
    private UserGenderMatched genderMatched;

    @Column(name = "show_age")
    private Boolean showAge;

    @Column(name = "show_gender_displayed")
    private Boolean showGenderDisplayed;

}
