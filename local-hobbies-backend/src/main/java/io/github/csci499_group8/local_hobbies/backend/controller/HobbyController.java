package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.service.HobbyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hobbies")
@RequiredArgsConstructor
@Validated
public class HobbyController {

    private final HobbyService hobbyService;

    // --- user hobbies ---

    @GetMapping
    public ResponseEntity<List<HobbyResponse>> getHobbies(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(hobbyService.getHobbies(userId));
    }

    @PostMapping
    public ResponseEntity<HobbyResponse> addHobby(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody HobbyCreationRequest request) {
        HobbyResponse response = hobbyService.addHobby(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{hobbyId}")
    public ResponseEntity<HobbyResponse> updateHobby(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID hobbyId,
            @Valid @RequestBody HobbyUpdateRequest request) {
        return ResponseEntity.ok(hobbyService.updateHobby(userId, hobbyId, request));
    }

    @DeleteMapping("/{hobbyId}")
    public ResponseEntity<Void> deleteHobby(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID hobbyId) {
        hobbyService.deleteHobby(userId, hobbyId);
        return ResponseEntity.noContent().build();
    }

    // --- global hobbies ---

    @GetMapping("/global")
    public ResponseEntity<List<GlobalHobbyResponse>> getGlobalHobbies() {
        return ResponseEntity.ok(hobbyService.getGlobalHobbies());
    }

    // --- hobby photos ---

    @PostMapping("/{hobbyId}/photos/upload-url")
    public ResponseEntity<UploadUrlResponse> getHobbyPhotoUploadUrl(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID hobbyId,
            @Valid @RequestBody UploadUrlRequest request) {
        return ResponseEntity.ok(hobbyService.generatePresignedUploadUrl(userId, hobbyId, request));
    }

    @GetMapping("/photos")
    public ResponseEntity<List<HobbyPhotoResponse>> getHobbyPhotos(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(hobbyService.getHobbyPhotos(userId));
    }

    //TODO: restrict by userId? if a user should only be able to call this on their own hobby photos
    @GetMapping("/{hobbyId}/photos")
    public ResponseEntity<List<HobbyPhotoResponse>> getHobbyPhotosByHobbyId(
            @PathVariable UUID hobbyId) {
        return ResponseEntity.ok(hobbyService.getHobbyPhotosByHobbyId(hobbyId));
    }

    @PostMapping("/{hobbyId}/photos")
    public ResponseEntity<HobbyPhotoResponse> addHobbyPhoto(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID hobbyId,
            @Valid @RequestBody HobbyPhotoCreationRequest request) {
        HobbyPhotoResponse response = hobbyService.addHobbyPhoto(userId, hobbyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/photos/{photoId}")
    public ResponseEntity<HobbyPhotoResponse> updateHobbyPhoto(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID photoId,
            @Valid @RequestBody HobbyPhotoUpdateRequest request) {
        return ResponseEntity.ok(hobbyService.updateHobbyPhoto(userId, photoId, request));
    }

    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<Void> deleteHobbyPhoto(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID photoId) {
        hobbyService.deleteHobbyPhoto(userId, photoId);
        return ResponseEntity.noContent().build();
    }
}
