package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.common.UploadUrlResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.service.HobbyService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hobbies")
@RequiredArgsConstructor
@Validated
public class HobbyController {

    private final HobbyService hobbyService;
    
    // --- user hobbies ---

    @GetMapping
    public ResponseEntity<List<HobbyResponse>> getCurrentUserHobbies(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(hobbyService.getCurrentUserHobbies(userId));
    }

    @PostMapping
    public ResponseEntity<HobbyResponse> addHobby(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody HobbyCreationRequest request) {
        HobbyResponse response = hobbyService.addHobby(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{hobbyId}")
    public ResponseEntity<HobbyResponse> updateHobby(
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer hobbyId,
            @Valid @RequestBody HobbyUpdateRequest request) {
        return ResponseEntity.ok(hobbyService.updateHobby(userId, hobbyId, request));
    }

    @DeleteMapping("/{hobbyId}")
    public ResponseEntity<Void> deleteHobby(
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer hobbyId) {
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
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer hobbyId,
            @Valid @RequestBody UploadUrlRequest request) {
        return ResponseEntity.ok(hobbyService.generatePresignedUploadUrl(userId, hobbyId, request));
    }

    @GetMapping("/photos")
    public ResponseEntity<List<HobbyPhotoResponse>> getCurrentUserHobbyPhotos(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(hobbyService.getCurrentUserHobbyPhotos(userId));
    }

    @PostMapping("/photos")
    public ResponseEntity<HobbyPhotoResponse> addHobbyPhoto(
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer hobbyId,
            @Valid @RequestBody HobbyPhotoCreationRequest request) {
        HobbyPhotoResponse response = hobbyService.addHobbyPhoto(userId, hobbyId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/photos/{photoId}")
    public ResponseEntity<HobbyPhotoResponse> updateHobbyPhoto(
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer photoId,
            @Valid @RequestBody HobbyPhotoUpdateRequest request) {
        return ResponseEntity.ok(hobbyService.updateHobbyPhoto(userId, photoId, request));
    }

    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<Void> deleteHobbyPhoto(
            @RequestAttribute("userId") Integer userId,
            @PathVariable @Positive Integer photoId) {
        hobbyService.deleteHobbyPhoto(userId, photoId);
        return ResponseEntity.noContent().build();
    }
}