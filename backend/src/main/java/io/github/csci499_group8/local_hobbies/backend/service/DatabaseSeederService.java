package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.model.*;
import io.github.csci499_group8.local_hobbies.backend.model.enums.*;
import io.github.csci499_group8.local_hobbies.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.*;
import java.util.List;

/**
 * Runs during application startup and seeds the database with 20 realistic users,
 * each with hobbies, a recurring availability, a one-time availability, and a hobby
 * photo whose object key points to an image already uploaded to Supabase storage.
 *
 * <h3>Activation</h3>
 * Set in application.yaml:
 * <pre>
 *   application.seeder.enabled=true
 * </pre>
 * The seeder is fully idempotent: if any users already exist it exits
 * immediately without touching the database or storage bucket.
 *
 * <h3>Seed images</h3>
 * Place JPEG files under {@code src/main/resources/seed/}:
 * <pre>
 *   seed/profile/p01.jpg … seed/profile/p20.jpg   (profile photos)
 *   seed/hobby/h01.jpg   … seed/hobby/h20.jpg      (hobby photos)
 * </pre>
 * The seeder uploads each file once under the key
 * {@code seed/profile/p01.jpg} / {@code seed/hobby/h01.jpg} etc., then
 * stores that key in {@code User.profilePhotoKey} /
 * {@code HobbyPhoto.photoKey}. If a classpath resource cannot be found the
 * corresponding photo key is left null and the app falls back to the
 * placeholder URL transparently.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeederService implements ApplicationRunner {

    private final UserRepository userRepository;
    private final HobbyRepository hobbyRepository;
    private final HobbyPhotoRepository hobbyPhotoRepository;
    private final RecurringAvailabilityRepository recurringAvailabilityRepository;
    private final OneTimeAvailabilityRepository oneTimeAvailabilityRepository;

    private final BCryptPasswordEncoder passwordEncoder;
    private final GeometryFactory geometryFactory;
    private final S3Client s3Client;
    private final ResourceLoader resourceLoader;

    @Value("${application.supabase-s3.bucket}")
    private String bucket;

    @Value("${application.seeder.enabled:false}")
    private boolean seederEnabled;

    // ------------------------------ seed data records -----------------------------

    private record SeedUser(
            int idx,
            String username,
            String email,
            String name,
            String birthDate,
            String genderDisplayed,
            UserGenderMatched genderMatched,
            String bio,
            double lat,
            double lon,
            String contactInfo,
            boolean showAge,
            boolean showGenderDisplayed
    ) {}

    private record SeedHobby(
            HobbyName name,
            HobbyExperienceLevel level
    ) {}

    // ------------------------------ seed data -----------------------------

    /**
     * 20 seed users scattered across NYC boroughs. Users 1-6 are clustered in Lower
     * Manhattan within ~5km of each other and share HIKING hobby with overlapping
     * Saturday morning availabilities in order to test match search.
     */
    private static final List<SeedUser> SEED_USERS = List.of(
        // MATCH CLUSTER: Lower Manhattan (users 1-6 share HIKING, Saturday 10:00)
        new SeedUser(1,  "alice_w",   "alice@seed.dev",   "Alice Walker",    "1992-04-15", "Woman",      UserGenderMatched.WOMAN,    "Loves hiking and baking.", 40.7128, -74.0060, "alice@seed.dev", true, true),      // Financial District
        new SeedUser(2,  "bob_r",     "bob@seed.dev",     "Bob Rivera",      "1988-11-30", "Man",        UserGenderMatched.MAN,      "Camper & hiker.", 40.7177, -74.0059, "bob@seed.dev", true, true),          // Tribeca (0.5km from alice_w)
        new SeedUser(3,  "cass_n",    "cass@seed.dev",    "Cassidy Nguyen",  "1995-07-22", "Nonbinary",  UserGenderMatched.NONBINARY,"Into hiking and programming.", 40.7223, -74.0009, "cass@seed.dev", true, false),     // SoHo (1.2km from alice_w)
        new SeedUser(4,  "dani_m",    "dani@seed.dev",    "Daniela Morales", "1990-02-10", "Woman",      UserGenderMatched.WOMAN,    "Reader and weekend hiker.", 40.7282, -73.9942, "dani@seed.dev", false, true), // Greenwich Village (2.1km)
        new SeedUser(5,  "evan_k",    "evan@seed.dev",    "Evan Kim",        "1993-09-05", "Man",        UserGenderMatched.MAN,      "Hikes with animal companions.", 40.7359, -74.0014, "evan@seed.dev", true, true),        // West Village (2.6km)
        new SeedUser(6,  "fiona_l",   "fiona@seed.dev",   "Fiona Lee",       "1997-01-28", "Woman",      UserGenderMatched.WOMAN,    "Baker and reader.", 40.7489, -73.9680, "fiona@seed.dev", true, true),      // Chelsea (4.7km)

        // Rest of Manhattan
        new SeedUser(7,  "grace_o",   "grace@seed.dev",   "Grace Okonkwo",   "1991-06-14", "Woman",      UserGenderMatched.WOMAN,    "Swimmer and music producer.", 40.7614, -73.9776, "grace@seed.dev", true, false),
        new SeedUser(8,  "henry_p",   "henry@seed.dev",   "Henry Park",      "1986-12-03", "Man",        UserGenderMatched.MAN,      "Woodworking and camping trips.", 40.7831, -73.9712, "henry@seed.dev", false, true),
        new SeedUser(9,  "iris_v",    "iris@seed.dev",    "Iris Vasquez",    "1999-03-17", "Woman",      UserGenderMatched.WOMAN,    "Pianist and essay writer.", 40.7589, -73.9851, "iris@seed.dev", true, true),
        new SeedUser(10, "jake_t",    "jake@seed.dev",    "Jake Thompson",   "1994-08-21", "Man",        UserGenderMatched.MAN,      "Soccer player and grilling.", 40.7903, -73.9598, "jake@seed.dev", true, true),

        // Brooklyn
        new SeedUser(11, "kira_b",    "kira@seed.dev",    "Kira Banks",      "1996-05-09", "Woman",      UserGenderMatched.WOMAN,    "Weightlifter and science buff.", 40.6782, -73.9442, "kira@seed.dev", true, true),
        new SeedUser(12, "leo_j",     "leo@seed.dev",     "Leo Jensen",      "1989-10-25", "Man",        UserGenderMatched.MAN,      "Bird-watcher and audiobooks fan.", 40.6501, -73.9496, "leo@seed.dev", false, false),
        new SeedUser(13, "maya_c",    "maya@seed.dev",    "Maya Chen",       "1998-02-02", "Woman",      UserGenderMatched.WOMAN,    "Dancer and cake decorator.", 40.6928, -73.9903, "maya@seed.dev", true, true),

        // Queens
        new SeedUser(14, "noah_a",    "noah@seed.dev",    "Noah Adams",      "1987-07-30", "Man",        UserGenderMatched.MAN,      "Runs marathons, loves fishing.", 40.7282, -73.7949, "noah@seed.dev", true, true),
        new SeedUser(15, "olivia_s",  "olivia@seed.dev",  "Olivia Sanchez",  "1993-11-11", "Woman",      UserGenderMatched.WOMAN,    "Electronics hobbyist and singer.", 40.7614, -73.8348, "olivia@seed.dev", true, false),
        new SeedUser(16, "paul_m",    "paul@seed.dev",    "Paul Murray",     "1990-04-04", "Man",        UserGenderMatched.MAN,      "Plays piano and reads nonfiction.", 40.7498, -73.8800, "paul@seed.dev", false, true),

        // Bronx
        new SeedUser(17, "quinn_r",   "quinn@seed.dev",   "Quinn Reeves",    "1995-09-19", "Nonbinary",  UserGenderMatched.NONBINARY,"RPG gamer and gardener.", 40.8448, -73.8648, "quinn@seed.dev", true, true),
        new SeedUser(18, "rose_d",    "rose@seed.dev",    "Rose Dubois",     "1992-12-28", "Woman",      UserGenderMatched.WOMAN,    "Traveling and volunteering.", 40.8275, -73.9261, "rose@seed.dev", true, true),

        // Staten Island
        new SeedUser(19, "sam_h",     "sam@seed.dev",     "Sam Hassan",      "1988-06-06", "Man",        UserGenderMatched.MAN,      "History enthusiast and cyclist.", 40.5795, -74.1502, "sam@seed.dev", false, true),
        new SeedUser(20, "tara_w",    "tara@seed.dev",    "Tara Williams",   "1997-03-14", "Woman",      UserGenderMatched.WOMAN,    "Photography and meal prepping.", 40.6333, -74.1224, "tara@seed.dev", true, true)
    );

    /**
     * Three hobbies per user. Users 1-6 (Lower Manhattan cluster) all share HIKING
     * to test match-search hobby filtering and scoring. Index is 1-based to match SEED_USERS.
     */
    private static final List<List<SeedHobby>> SEED_HOBBIES = List.of(
        // MATCH CLUSTER: users 1-6 share HIKING
        // user 1
        List.of(new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.BAKING, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.PHOTOGRAPHY, HobbyExperienceLevel.ADVANCED)),
        // user 2
        List.of(new SeedHobby(HobbyName.CAMPING, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.BOARD_GAMES, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.ADVANCED)),
        // user 3
        List.of(new SeedHobby(HobbyName.YOGA, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.PROGRAMMING, HobbyExperienceLevel.ADVANCED)),
        // user 4
        List.of(new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.LANGUAGE_LEARNING, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.READING_FICTION, HobbyExperienceLevel.INTERMEDIATE)),
        // user 5
        List.of(new SeedHobby(HobbyName.BOARD_GAMES, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.RUNNING, HobbyExperienceLevel.BEGINNER)),
        // user 6
        List.of(new SeedHobby(HobbyName.BAKING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.READING_FICTION, HobbyExperienceLevel.ADVANCED)),
        
        // user 7
        List.of(new SeedHobby(HobbyName.SWIMMING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.MUSIC_PRODUCTION, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.DANCING, HobbyExperienceLevel.BEGINNER)),
        // user 8
        List.of(new SeedHobby(HobbyName.WOODWORKING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.CAMPING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.FISHING, HobbyExperienceLevel.INTERMEDIATE)),
        // user 9
        List.of(new SeedHobby(HobbyName.PIANO, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.ESSAY_WRITING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.READING_POETRY, HobbyExperienceLevel.INTERMEDIATE)),
        // user 10
        List.of(new SeedHobby(HobbyName.SOCCER, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.GRILLING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.WEIGHTLIFTING, HobbyExperienceLevel.BEGINNER)),
        // user 11
        List.of(new SeedHobby(HobbyName.WEIGHTLIFTING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.SCIENCE, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.RUNNING, HobbyExperienceLevel.INTERMEDIATE)),
        // user 12
        List.of(new SeedHobby(HobbyName.BIRD_WATCHING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.AUDIOBOOKS, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.ADVANCED)),
        // user 13
        List.of(new SeedHobby(HobbyName.DANCING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.CAKE_DECORATING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.PHOTOGRAPHY, HobbyExperienceLevel.BEGINNER)),
        // user 14
        List.of(new SeedHobby(HobbyName.RUNNING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.FISHING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.CYCLING, HobbyExperienceLevel.INTERMEDIATE)),
        // user 15
        List.of(new SeedHobby(HobbyName.ELECTRONICS, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.SINGING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.PROGRAMMING, HobbyExperienceLevel.INTERMEDIATE)),
        // user 16
        List.of(new SeedHobby(HobbyName.PIANO, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.READING_NONFICTION, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.HISTORY, HobbyExperienceLevel.ADVANCED)),
        // user 17
        List.of(new SeedHobby(HobbyName.ROLE_PLAYING_GAMES, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.GARDENING, HobbyExperienceLevel.BEGINNER),
                new SeedHobby(HobbyName.READING_COMICS, HobbyExperienceLevel.INTERMEDIATE)),
        // user 18
        List.of(new SeedHobby(HobbyName.TRAVELING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.VOLUNTEERING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.DANCING, HobbyExperienceLevel.BEGINNER)),
        // user 19
        List.of(new SeedHobby(HobbyName.HISTORY, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.CYCLING, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.CARD_GAMES, HobbyExperienceLevel.INTERMEDIATE)),
        // user 20
        List.of(new SeedHobby(HobbyName.PHOTOGRAPHY, HobbyExperienceLevel.ADVANCED),
                new SeedHobby(HobbyName.MEAL_PREPPING, HobbyExperienceLevel.INTERMEDIATE),
                new SeedHobby(HobbyName.HIKING, HobbyExperienceLevel.BEGINNER))
    );

    // ------------------------------ ApplicationRunner -----------------------------

    @Override
    public void run(ApplicationArguments args) {
        if (!seederEnabled) {
            log.debug("DatabaseSeederService: seeder disabled (application.seeder.enabled=false).");
            return;
        }

        if (userRepository.count() > 0) {
            log.info("DatabaseSeederService: database already contains users — skipping seed.");
            return;
        }

        log.info("DatabaseSeederService: seeding {} users …", SEED_USERS.size());
        String hashedPassword = passwordEncoder.encode("Seed1234!");

        for (int i = 0; i < SEED_USERS.size(); i++) {
            SeedUser su = SEED_USERS.get(i);
            int userIdx = i + 1; // 1-based, matches SEED_HOBBIES index

            // 1. Upload profile photo (if classpath resource exists)
            String profilePhotoKey = uploadSeedImage(
                    "classpath:seed/profile/p%02d.jpg".formatted(userIdx),
                    "seed/profile/p%02d.jpg".formatted(userIdx)
            );

            // 2. Persist user
            Point location = makePoint(su.lat(), su.lon());
            User user = User.builder()
                            .username(su.username())
                            .email(su.email())
                            .password(hashedPassword)
                            .name(su.name())
                            .birthDate(LocalDate.parse(su.birthDate()))
                            .genderDisplayed(su.genderDisplayed())
                            .genderMatched(su.genderMatched())
                            .bio(su.bio())
                            .locationPoint(location)
                            .locationApproximate("New York, NY")
                            .contactInfo(su.contactInfo())
                            .profilePhotoKey(profilePhotoKey) // null results in placeholder URL at read time
                            .showAge(su.showAge())
                            .showGenderDisplayed(su.showGenderDisplayed())
                            .onboardingComplete(true)
                            .lastSessionTime(OffsetDateTime.now())
                            .build();
            user = userRepository.save(user);

            // 3. Persist hobbies
            List<SeedHobby> seedHobbies = SEED_HOBBIES.get(i);
            for (int h = 0; h < seedHobbies.size(); h++) {
                SeedHobby sh = seedHobbies.get(h);
                Hobby hobby = Hobby.builder()
                                   .userId(user.getId())
                                   .name(sh.name())
                                   .experienceLevel(sh.level())
                                   .build();
                hobby = hobbyRepository.save(hobby);

                // 4. Attach one photo to the first hobby only
                if (h == 0) {
                    String photoKey = uploadSeedImage(
                            "classpath:seed/hobby/h%02d.jpg".formatted(userIdx),
                            "seed/hobby/h%02d.jpg".formatted(userIdx)
                    );
                    if (photoKey != null) {
                        HobbyPhoto photo = HobbyPhoto.builder()
                                                     .hobbyId(hobby.getId())
                                                     .photoKey(photoKey)
                                                     .caption("%s photo".formatted(sh.name().getLabel()))
                                                     .build();
                        hobbyPhotoRepository.save(photo);
                    }
                }
            }

            // 5. Recurring availability
            // Users 1-6 (match cluster): Saturday 10:00-13:00 EDT or EST for overlapping availability testing
            // Others: spread across weekdays
            DayOfWeek day;
            LocalTime startTime;
            Duration duration;

            if (userIdx <= 6) {
                day       = DayOfWeek.SATURDAY;
                startTime = LocalTime.of(10, 0);
                duration  = Duration.ofHours(3);
            } else {
                day       = DayOfWeek.of((userIdx % 7) + 1); // spread across weekdays
                startTime = LocalTime.of(8 + (userIdx % 4) * 2, 0); // 08:00 / 10:00 / 12:00 / 14:00
                duration  = Duration.ofHours(2 + (userIdx % 3)); // 2 / 3 / 4 hours
            }

            RecurringAvailability recAvail = RecurringAvailability.builder()
                    .userId(user.getId())
                    .location(location)
                    .frequency(AvailabilityFrequency.WEEKLY)
                    .startDayOfWeek(day)
                    .startTime(startTime)
                    .duration(duration)
                    .ruleStart(LocalDate.now())
                    .ruleEnd(LocalDate.now().plusMonths(5))
                    .timeZoneId("America/New_York")
                    .build();
            recurringAvailabilityRepository.save(recAvail);

            // 6. One-time availability (upcoming Saturday evening) for even-indexed users
            if (userIdx % 2 == 0) {
                LocalDate nextSaturday = LocalDate.now().with(java.time.temporal.TemporalAdjusters.next(DayOfWeek.SATURDAY));
                OffsetDateTime start = nextSaturday.atTime(startTime.plusHours(9)).atOffset(ZoneOffset.ofHours(-4)); // 19:00 EDT (Mar-Oct)
                OneTimeAvailability otAvail = OneTimeAvailability.builder()
                        .userId(user.getId())
                        .location(location)
                        .start(start)
                        .duration(Duration.ofHours(2))
                        .build();
                oneTimeAvailabilityRepository.save(otAvail);
            }

            log.debug("DatabaseSeederService: seeded user {} ({})", userIdx, su.username());
        }

        log.info("DatabaseSeederService: seeding complete.");
    }

    // ------------------------------ helper methods -----------------------------

    /**
     * Upload a classpath image to Supabase under {@code objectKey} and return
     * the key. Returns {@code null} if the resource does not exist (so that
     * {@code profilePhotoKey} / {@code HobbyPhoto.photoKey} stay null and the
     * application falls back to its configured placeholder URL).
     */
    private String uploadSeedImage(String classpathLocation, String objectKey) {
        //check if object exists in bucket
        try {
            s3Client.headObject(b -> b.bucket(bucket).key(objectKey)); //throws 404 if object is absent; jumps to catch
            log.debug("Image {} already exists in bucket — skipping upload step.", objectKey);
            return objectKey; //if reaches here, key is present, so skip network payload upload
        } catch (software.amazon.awssdk.services.s3.model.S3Exception e) { //404s fall through to rest of method
            if (e.statusCode() != 404) {
                log.warn("Error checking S3 key existence: {}", e.getMessage());
            }
        }

        Resource resource = resourceLoader.getResource(classpathLocation);
        if (!resource.exists()) {
            log.debug("DatabaseSeederService: seed image not found at {} — skipping upload.", classpathLocation);
            return null;
        }
        try {
            byte[] bytes = resource.getInputStream().readAllBytes();
            PutObjectRequest request = PutObjectRequest.builder()
                                                       .bucket(bucket)
                                                       .key(objectKey)
                                                       .contentType("image/jpeg")
                                                       .contentLength((long) bytes.length)
                                                       .build();
            s3Client.putObject(request, RequestBody.fromBytes(bytes));
            log.debug("DatabaseSeederService: uploaded {} → s3://{}/{}", classpathLocation, bucket, objectKey);
            return objectKey;
        } catch (IOException | software.amazon.awssdk.core.exception.SdkException e) {
            log.warn("DatabaseSeederService: failed to upload {} — {}", classpathLocation, e.getMessage());
            return null;
        }
    }

    private Point makePoint(double lat, double lon) {
        // JTS Coordinate is (x = longitude, y = latitude) for WGS-84
        return geometryFactory.createPoint(new Coordinate(lon, lat));
    }

}
