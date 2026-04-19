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
import io.github.csci499_group8.local_hobbies.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final HobbyService hobbyService;
    private final AvailabilityService availabilityService;
    private final MatchService matchService;
    private final StorageService storageService;
    private final LocationService locationService;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final int MIN_NUM_HOBBIES = 3;
    private static final int MIN_NUM_AVAILABILITIES = 1;

    // --- methods called by AuthService ---

    @Transactional
    public User createUser(AuthSignupRequest request) {
        if (userRepository.existsByUsername(request.username())
                || userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException(
                    "Username or email is already associated with an account");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = userMapper.toEntity(request, passwordHash);
        return userRepository.save(user);
    }

    public boolean getUserExistsById(Integer userId) {
        return userRepository.existsById(userId);
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User processOnboarding(Integer userId, UserOnboardingRequest request) {
        User user = userRepository.getById(userId);
        String locationApproximate = getApproximateLocation(userId, request.location());
        userMapper.updateEntity(request, locationApproximate, user);

        hobbyService.addOnboardingHobbies(userId, request);
        availabilityService.addOnboardingAvailabilities(userId, request);

        user.setOnboardingComplete(checkOnboardingCompletion(user));

        return userRepository.save(user);
    }

    // --- methods called by UserController ---

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Integer userId) {
        return userMapper.toResponse(userRepository.getById(userId));
    }

    @Transactional(readOnly = true)
    public List<UserOnboardingIncompleteSection> getIncompleteSections(Integer userId) {
        User user = userRepository.getById(userId);

        List<UserOnboardingIncompleteSection> incompleteSections = new ArrayList<>();

        //noValue checks
        if (user.getName() == null || user.getName().isBlank()) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.name, IncompleteReason.noValue));
        }
        if (user.getBirthDate() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.birthDate, IncompleteReason.noValue));
        }
        if (user.getLocationPoint() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.location, IncompleteReason.noValue));
        }
        if (user.getPublicContactInfo() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.publicContactInfo, IncompleteReason.noValue));
        }
        if (user.getGenderMatched() == null) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.genderMatched, IncompleteReason.noValue));
        }

        //minCountNotMet checks
        long hobbyCount = hobbyService.getHobbyCount(userId);
        if (hobbyCount < MIN_NUM_HOBBIES) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.hobbies,
                hobbyCount == 0 ? IncompleteReason.noValue : IncompleteReason.minCountNotMet
            ));
        }
        long availabilityCount = availabilityService.getAvailabilityCount(userId);
        if (availabilityCount < MIN_NUM_AVAILABILITIES) {
            incompleteSections.add(new UserOnboardingIncompleteSection(
                SectionName.availabilities,
                availabilityCount == 0 ? IncompleteReason.noValue : IncompleteReason.minCountNotMet
            ));
        }

        return incompleteSections;
    }

    @Transactional
    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        User user = userRepository.getById(userId);
        String locationApproximate = getApproximateLocation(userId, request.location());
        userMapper.updateEntity(request, locationApproximate, user);

        return userMapper.toResponse(userRepository.save(user));
    }

    /**
     * Delete user and user's hobbies, hobby photos, availabilities, and matches
     */
    @Transactional
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public UploadUrlResponse generatePresignedUploadUrl(Integer userId, UploadUrlRequest request) {
        //key = file path/ID
        String objectKey = "users/" + userId + "/profile-photo";

        //get temporary PUT URL and expiration time from storage provider
        PresignedUrlData urlData = storageService.createPresignedPutUrl(objectKey, request.contentType());

        return new UploadUrlResponse(objectKey, urlData.url(), urlData.expirationTime());
    }

    @Transactional(readOnly = true)
    public UserHomepageResponse getHomepage(Integer userId) {
        User user = userRepository.getById(userId);

        UserSummary userSummary = new UserSummary(user.getId(),
                                                  user.getName(),
                                                  user.getProfilePhotoUrl());
        HobbySummary hobbySummary = new HobbySummary(hobbyService.getHobbyCount(userId));
        MatchSummary matchSummary = new MatchSummary(matchService.getMatchCount(userId));

        return new UserHomepageResponse(userSummary,
                                        hobbySummary,
                                        new AvailabilitySummary(), //TODO: replace with booking
                                        matchSummary);
    }

    @Transactional(readOnly = true)
    public CurrentUserProfileResponse getCurrentUserProfile(Integer userId) {
        User user = userRepository.getById(userId);
        List<HobbyResponse> hobbies = hobbyService.getHobbiesByUserId(userId);
        List<HobbyPhotoResponse> hobbyPhotos = hobbyService.getHobbyPhotosByUserId(userId);

        return userMapper.toCurrentProfileResponse(user, hobbies, hobbyPhotos);
    }

    @Transactional(readOnly = true)
    public OtherUserProfileResponse getOtherUserProfile(Integer currentUserId, Integer otherUserId) {
        UserResponse otherUser = findOtherUserOrThrow(otherUserId);

        List<HobbyResponse> otherUserHobbies = hobbyService.getHobbiesByUserId(otherUserId);
        List<HobbyPhotoResponse> otherUserHobbyPhotos = hobbyService.getHobbyPhotosByUserId(otherUserId);

        boolean isSavedMatch = matchService.isSavedMatch(currentUserId, otherUserId);
        List<HobbyOverlapResponse> overlappingHobbies = hobbyService
                .getOverlappingHobbies(currentUserId, otherUserId);
        List<AvailabilityOverlapResponse> overlappingAvailabilities = availabilityService
                .getOverlappingAvailabilities(currentUserId, otherUserId);

        return userMapper.toOtherProfileResponse(otherUser, otherUserHobbies, otherUserHobbyPhotos,
                                                 isSavedMatch, overlappingHobbies, overlappingAvailabilities);
    }

    // --- methods called by services ---

    @Transactional(readOnly = true)
    public UserResponse findOtherUserOrThrow(Integer otherUserId) {
        User otherUser = userRepository.findById(otherUserId).orElseThrow(
                () -> new ResourceNotFoundException("User not found with ID: " + otherUserId)
        );

        return userMapper.toResponse(otherUser);
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
        Integer userId = user.getId();
        Integer hobbyCount = hobbyService.getHobbyCount(userId);
        Integer availabilityCount = availabilityService.getAvailabilityCount(userId);

        return user.getName() != null && !user.getName().isBlank()
                && user.getBirthDate() != null
                && user.getLocationPoint() != null
                && user.getPublicContactInfo() != null && !user.getPublicContactInfo().isBlank()
                && user.getGenderMatched() != null
                && user.getShowAge() != null
                && user.getShowGenderDisplayed() != null
                && hobbyCount >= MIN_NUM_HOBBIES
                && availabilityCount >= MIN_NUM_AVAILABILITIES;
    }

    private String getApproximateLocation(Integer userId, GeoJsonPoint locationPoint) {
        return locationService.getCityFromPoint(locationPoint.getLongitude(), locationPoint.getLatitude());
    }

}
