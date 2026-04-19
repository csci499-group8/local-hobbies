package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.*;
import io.github.csci499_group8.local_hobbies.backend.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
@Validated
public class AvailabilityController {

    //TODO: normalize ResponseEntities; some POSTs use .ok(), some use .status().body(),
    //TODO: (related to 200/201/204 responses?)

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<ScheduleResponse> getSchedule(
            @RequestAttribute("userId") Integer userId) {
        return ResponseEntity.ok(availabilityService.getSchedule(userId));
    }

    // --- one-time availabilities ---

    @PostMapping("/one-time")
    public ResponseEntity<OneTimeAvailabilityResponse> addOneTimeAvailability(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody OneTimeAvailabilityCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createOneTime(userId, request));
    }

    @PutMapping("/one-time/{oneTimeId}")
    public ResponseEntity<OneTimeAvailabilityResponse> updateOneTimeAvailability(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer oneTimeId,
            @Valid @RequestBody OneTimeAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateOneTime(userId, oneTimeId, request));
    }

    @DeleteMapping("/one-time/{oneTimeId}")
    public ResponseEntity<Void> deleteOneTimeAvailability(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer oneTimeId) {
        availabilityService.deleteOneTime(userId, oneTimeId);
        return ResponseEntity.noContent().build();
    }

    // --- recurring availabilities ---

    @PostMapping("/recurring")
    public ResponseEntity<RecurringAvailabilityResponse> addRecurringAvailability(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody RecurringAvailabilityCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createRecurring(userId, request));
    }

    @PutMapping("/recurring/{recurringId}")
    public ResponseEntity<RecurringAvailabilityResponse> updateRecurringAvailability(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer recurringId,
            @Valid @RequestBody RecurringAvailabilityUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateRecurring(userId, recurringId, request));
    }

    @DeleteMapping("/recurring/{recurringId}")
    public ResponseEntity<Void> deleteRecurringAvailability(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer recurringId) {
        availabilityService.deleteRecurring(userId, recurringId);
        return ResponseEntity.noContent().build();
    }

    // --- recurring availability exceptions ---

    @PostMapping("/exceptions")
    public ResponseEntity<AvailabilityExceptionResponse> addException(
            @RequestAttribute("userId") Integer userId,
            @Valid @RequestBody AvailabilityExceptionCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(availabilityService.createException(userId, request));
    }

    @PutMapping("/exceptions/{exceptionId}")
    public ResponseEntity<AvailabilityExceptionResponse> updateException(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer exceptionId,
            @Valid @RequestBody AvailabilityExceptionUpdateRequest request) {
        return ResponseEntity.ok(availabilityService.updateException(userId, exceptionId, request));
    }

    @DeleteMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Void> deleteException(
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer exceptionId) {
        availabilityService.deleteException(userId, exceptionId);
        return ResponseEntity.noContent().build();
    }

}