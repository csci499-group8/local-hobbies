package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.service.AuthService;
import io.github.csci499_group8.local_hobbies.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/onboarding")
    public ResponseEntity<Map<String, List<UserOnboardingIncompleteSection>>> getOnboardingStatus(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(Map.of("incompleteSections", userService.getIncompleteSections(userId)));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<AuthResponse> completeOnboarding(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody UserOnboardingRequest request) {
        //also returns a fresh token with updated claims/status
        return ResponseEntity.ok(authService.completeOnboarding(userId, request));
    }

    @GetMapping
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(userService.getCurrentUser(userId));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCurrentUser(
            @RequestAttribute("userId") UUID userId) {
        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/profile-photo/upload-url")
    public ResponseEntity<UploadUrlResponse> getProfilePhotoUploadUrl(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody UploadUrlRequest request) {
        return ResponseEntity.ok(userService.generatePresignedUploadUrl(
                userId, //to generate user-specific file path
                request
        ));
    }

    @GetMapping("/homepage")
    public ResponseEntity<UserHomepageResponse> getHomepage(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(userService.getHomepage(userId));
    }

    @GetMapping("/profile")
    public ResponseEntity<CurrentUserProfileResponse> getCurrentUserProfile(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(userId));
    }

    @GetMapping("/{otherUserId}/profile")
    public ResponseEntity<OtherUserProfileResponse> getOtherUserProfile(
            @RequestAttribute("userId") UUID currentUserId,
            @PathVariable UUID otherUserId) {
        return ResponseEntity.ok(userService.getOtherUserProfile(currentUserId, otherUserId));
    }

}
