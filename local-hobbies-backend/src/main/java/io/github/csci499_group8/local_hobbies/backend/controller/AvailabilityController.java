package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
@Validated
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<ScheduleResponse> getSchedule(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(availabilityService.getSchedule(userId));
    }

    // --- one-time availabilities ---

    @PostMapping("/one-times")
    public ResponseEntity<OneTimeAvailabilityResponse> addOneTimeAvailability(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody OneTimeAvailabilityCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createOneTime(userId, request));
    }

    @PutMapping("/one-times/{oneTimeId}")
    public ResponseEntity<OneTimeAvailabilityResponse> updateOneTimeAvailability(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID oneTimeId,
            @Valid @RequestBody OneTimeAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateOneTime(userId, oneTimeId, request));
    }

    @DeleteMapping("/one-times/{oneTimeId}")
    public ResponseEntity<Void> deleteOneTimeAvailability(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID oneTimeId) {
        availabilityService.deleteOneTime(userId, oneTimeId);
        return ResponseEntity.noContent().build();
    }

    // --- recurring availabilities ---

    @PostMapping("/recurrings")
    public ResponseEntity<RecurringAvailabilityResponse> addRecurringAvailability(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody RecurringAvailabilityCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createRecurring(userId, request));
    }

    @PutMapping("/recurrings/{recurringId}")
    public ResponseEntity<RecurringAvailabilityResponse> updateRecurringAvailability(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID recurringId,
            @Valid @RequestBody RecurringAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateRecurring(userId, recurringId, request));
    }

    @DeleteMapping("/recurrings/{recurringId}")
    public ResponseEntity<Void> deleteRecurringAvailability(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID recurringId) {
        availabilityService.deleteRecurring(userId, recurringId);
        return ResponseEntity.noContent().build();
    }

    // --- recurring availability exceptions ---

    @PostMapping("/exceptions")
    public ResponseEntity<AvailabilityExceptionResponse> addException(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody AvailabilityExceptionCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createException(userId, request));
    }

    @PutMapping("/exceptions/{exceptionId}")
    public ResponseEntity<AvailabilityExceptionResponse> updateException(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID exceptionId,
            @Valid @RequestBody AvailabilityExceptionUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateException(userId, exceptionId, request));
    }

    @DeleteMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Void> deleteException(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID exceptionId) {
        availabilityService.deleteException(userId, exceptionId);
        return ResponseEntity.noContent().build();
    }

}
