package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.service.AuthService;
import io.github.csci499_group8.local_hobbies.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/onboarding")
    public ResponseEntity<List<UserOnboardingIncompleteSection>> getOnboardingStatus(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(userService.getIncompleteSections(userId));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<AuthResponse> completeOnboarding(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody UserOnboardingRequest request) {
        //also returns a fresh token with updated claims/status
        return ResponseEntity.ok(authService.completeOnboarding(userId, request));
    }

    @GetMapping
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(userService.getCurrentUser(userId));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCurrentUser(
            @RequestAttribute("userId") Integer userId) {
        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/profile-photo/upload-url")
    public ResponseEntity<UploadUrlResponse> getProfilePhotoUploadUrl(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody UploadUrlRequest request) {
        return ResponseEntity.ok(userService.generatePresignedUploadUrl(
                userId, //to generate user-specific file path
                request
        ));
    }

    @GetMapping("/homepage")
    public ResponseEntity<UserHomepageResponse> getHomepage(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(userService.getHomepage(userId));
    }

    @GetMapping("/profile")
    public ResponseEntity<CurrentUserProfileResponse> getCurrentUserProfile(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(userId));
    }

    @GetMapping("/{otherUserId}/profile")
    public ResponseEntity<OtherUserProfileResponse> getOtherUserProfile(
            @RequestAttribute("userId") Integer currentUserId,
            @PathVariable @Positive Integer otherUserId) {
        return ResponseEntity.ok(userService.getOtherUserProfile(currentUserId, otherUserId));
    }

}
