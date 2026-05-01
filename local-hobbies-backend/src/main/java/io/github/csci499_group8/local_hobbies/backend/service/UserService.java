package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.dto.user.UserOnboardingIncompleteSection.*;
import io.github.csci499_group8.local_hobbies.backend.dto.user.UserHomepageResponse.*;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.mapper.UserMapper;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchStatus;
import io.github.csci499_group8.local_hobbies.backend.repository.SavedMatchRepository;
import io.github.csci499_group8.local_hobbies.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final HobbyService hobbyService;
    private final AvailabilityService availabilityService;
    private final SavedMatchRepository savedMatchRepository;
    private final StorageService storageService;
    private final LocationService locationService;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${application.user.onboarding.min-num-hobbies}")
    private int minNumHobbies;
    @Value("${application.user.onboarding.min-num-availabilities}")
    private int minNumAvailabilities;

    // --- methods called by AuthService ---

    @Transactional
    public User createUser(AuthSignupRequest request) {
        if (userRepository.existsByUsername(request.username())
                || userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException(
                    "Username or email is already associated with an account");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = userMapper.toEntity(request, passwordHash, OffsetDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastSessionTime(User user) {
        user.setLastSessionTime(OffsetDateTime.now());
        userRepository.save(user);
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    //TODO: prevent partial updates to hobbies and availabilities
    @Transactional
    public User processOnboarding(UUID userId, UserOnboardingRequest request) {
        User user = getUserByIdOrThrow(userId);

        String locationApproximate = null;
        if (request.location() != null && request.location().isPresent()) {
            locationApproximate = getApproximateLocation(request.location().get());
        }

        userMapper.updateEntity(request, locationApproximate, user);

        if (request.hobbies() != null && request.hobbies().isPresent()) {
            hobbyService.addOnboardingHobbies(userId, request.hobbies().get());
        }

        if (request.availabilities() != null && request.availabilities().isPresent()) {
            availabilityService.addOnboardingAvailabilities(userId, request.availabilities().get());
        }

        user.setOnboardingComplete(checkOnboardingCompletion(user));

        return userRepository.save(user);
    }

    // --- methods called by UserController ---

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = getUserByIdOrThrow(userId);

        return userMapper.toResponse(user, getProfilePhotoUrl(user.getProfilePhotoKey()));
    }

    @Transactional(readOnly = true)
    public List<UserOnboardingIncompleteSection> getIncompleteSections(UUID userId) {
        User user = getUserByIdOrThrow(userId);

        List<UserOnboardingIncompleteSection> incompleteSections = new ArrayList<>();

        //noValue checks
        if (user.getName() == null || user.getName().isBlank()) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.name, IncompleteReason.NO_VALUE));
        }
        if (user.getBirthDate() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.birthDate, IncompleteReason.NO_VALUE));
        }
        if (user.getLocationPoint() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.location, IncompleteReason.NO_VALUE));
        }
        if (user.getPublicContactInfo() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.publicContactInfo, IncompleteReason.NO_VALUE));
        }
        if (user.getGenderMatched() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.genderMatched, IncompleteReason.NO_VALUE));
        }
        if (user.getShowAge() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.showAge, IncompleteReason.NO_VALUE));
        }
        if (user.getShowGenderDisplayed() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.showGenderDisplayed, IncompleteReason.NO_VALUE));
        }

        //minCountNotMet checks
        long hobbyCount = hobbyService.getHobbyCount(userId);
        if (hobbyCount < minNumHobbies) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.hobbies,
                hobbyCount == 0 ? IncompleteReason.NO_VALUE : IncompleteReason.MIN_COUNT_NOT_MET
            ));
        }
        long availabilityCount = availabilityService.getAvailabilityCount(userId);
        if (availabilityCount < minNumAvailabilities) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.availabilities,
                availabilityCount == 0 ? IncompleteReason.NO_VALUE : IncompleteReason.MIN_COUNT_NOT_MET
            ));
        }

        return incompleteSections;
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {
        User user = getUserByIdOrThrow(userId);

        String locationApproximate = null;
        if (request.location() != null && request.location().isPresent()) {
            locationApproximate = getApproximateLocation(request.location().get());
        }

        try {
            if (request.profilePhotoKey() != null) { //frontend has already uploaded new photo
                storageService.deleteObjects(List.of(user.getProfilePhotoKey()));
            }
        } catch (Exception e) {
            log.error("Failed to delete profile photo with key: {}", user.getProfilePhotoKey(), e);
        }

        userMapper.updateEntity(request, locationApproximate, user);
        user = userRepository.save(user);

        return userMapper.toResponse(user, getProfilePhotoUrl(user.getProfilePhotoKey()));
    }

    /**
     * Delete user and user's hobbies, hobby photos, availabilities, and matches
     */
    @Transactional
    public void deleteUser(UUID userId) {
        String profilePhotoKey = getUserByIdOrThrow(userId).getProfilePhotoKey();

        userRepository.deleteById(userId);

        try {
            storageService.deleteObjects(List.of(profilePhotoKey));
        } catch (Exception e) {
            log.error("Failed to delete profile photo with key: {}", profilePhotoKey, e);
        }
    }

    @Transactional(readOnly = true)
    public UploadUrlResponse generatePresignedUploadUrl(UUID userId, UploadUrlRequest request) {
        //key = file path/ID
        String objectKey = "users/" + userId + "/profile-photo";

        //get temporary PUT URL and expiration time from storage provider
        PresignedUrlData urlData = storageService.createPresignedPutUrl(objectKey, request.contentType());

        return new UploadUrlResponse(objectKey, urlData.url(), urlData.expirationTime());
    }

    @Transactional(readOnly = true)
    public UserHomepageResponse getHomepage(UUID userId) {
        User user = getUserByIdOrThrow(userId);

        UserSummary userSummary = new UserSummary(user.getName(),
                                                  getProfilePhotoUrl(user.getProfilePhotoKey()));
        HobbySummary hobbySummary = new HobbySummary(hobbyService.getHobbyCount(userId));
        MatchSummary matchSummary =
            new MatchSummary(savedMatchRepository.countBySavedUserIdAndStatus(userId, MatchStatus.ACTIVE));

        return new UserHomepageResponse(userSummary,
                                        hobbySummary,
                                        new AvailabilitySummary(), //TODO: replace with booking
                                        matchSummary);
    }

    @Transactional(readOnly = true)
    public CurrentUserProfileResponse getCurrentUserProfile(UUID userId) {
        User user = getUserByIdOrThrow(userId);
        String profilePhotoUrl = getProfilePhotoUrl(user.getProfilePhotoKey());
        List<HobbyResponse> hobbies = hobbyService.getHobbiesByUserId(userId);
        List<HobbyPhotoResponse> hobbyPhotos = hobbyService.getHobbyPhotosByUserId(userId);

        return userMapper.toCurrentProfileResponse(user, profilePhotoUrl, hobbies, hobbyPhotos);
    }

    @Transactional(readOnly = true)
    public OtherUserProfileResponse getOtherUserProfile(UUID currentUserId, UUID otherUserId) {
        User otherUser = getUserByIdOrThrow(otherUserId);
        String otherUserProfilePhotoUrl = getProfilePhotoUrl(otherUser.getProfilePhotoKey());

        List<HobbyResponse> otherUserHobbies = hobbyService.getHobbiesByUserId(otherUserId);
        List<HobbyPhotoResponse> otherUserHobbyPhotos = hobbyService.getHobbyPhotosByUserId(otherUserId);

        boolean isSavedMatch = savedMatchRepository.existsByUserIdAndSavedUserIdAndStatus(currentUserId,
                                                                                          otherUserId,
                                                                                          MatchStatus.ACTIVE);
        List<HobbyOverlapResponse> overlappingHobbies =
            hobbyService.getOverlappingHobbies(currentUserId, otherUserId);
        List<AvailabilityOverlapResponse> overlappingAvailabilities =
            availabilityService.getOverlappingAvailabilities(currentUserId, otherUserId);

        return userMapper.toOtherProfileResponse(otherUser, otherUserProfilePhotoUrl, otherUserHobbies,
                                                 otherUserHobbyPhotos, isSavedMatch, overlappingHobbies,
                                                 overlappingAvailabilities);
    }

    // --- methods called by services ---

    @Transactional(readOnly = true)
    public User getUserByIdOrThrow(UUID userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found with ID: " + userId)
        );
    }

    /**
     * Find users matching a search's hard filter criteria.
     */
    @Transactional(readOnly = true)
    public List<User> findUsersBySpecification(Specification<User> hardFilterSpec) {
        return userRepository.findAll(hardFilterSpec);
    }

    // --- private helper methods ---

    private boolean checkOnboardingCompletion(User user) {
        UUID userId = user.getId();
        Integer hobbyCount = hobbyService.getHobbyCount(userId);
        Integer availabilityCount = availabilityService.getAvailabilityCount(userId);

        return user.getName() != null && !user.getName().isBlank()
                && user.getBirthDate() != null
                && user.getLocationPoint() != null
                && user.getPublicContactInfo() != null && !user.getPublicContactInfo().isBlank()
                && user.getGenderMatched() != null
                && user.getShowAge() != null
                && user.getShowGenderDisplayed() != null
                && hobbyCount >= minNumHobbies
                && availabilityCount >= minNumAvailabilities;
    }

    private String getApproximateLocation(GeoJsonPoint locationPoint) {
        return locationService.getCityFromGeoJsonPoint(locationPoint);
    }

    private String getProfilePhotoUrl(String objectKey) {
        if (objectKey == null) return null;

        return storageService.createPresignedGetUrl(objectKey);
    }

}
