package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Validated
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/search")
    public ResponseEntity<List<MatchSearchResultResponse>> searchForMatches(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody MatchSearchRequest request) {
        return ResponseEntity.ok(matchService.searchForMatches(userId, request));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedMatchResponse>> getSavedMatches(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(matchService.getSavedMatches(userId));
    }

    @PostMapping("/saved")
    public ResponseEntity<SavedMatchResponse> saveMatch(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody SavedMatchCreationRequest request) {
        SavedMatchResponse response = matchService.createSavedMatch(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/saved/{matchId}")
    public ResponseEntity<SavedMatchResponse> updateSavedMatch(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID matchId,
            @Valid @RequestBody SavedMatchUpdateRequest request) {
        return ResponseEntity.ok(matchService.updateSavedMatch(userId, matchId, request));
    }

    @DeleteMapping("/saved/{matchId}")
    public ResponseEntity<Void> deleteSavedMatch(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID matchId) {
        matchService.deleteSavedMatch(userId, matchId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<SavedMatchResponse>> getDeletedSavedMatches(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(matchService.getDeletedSavedMatches(userId));
    }

    @PostMapping("/deleted/{matchId}")
    public ResponseEntity<SavedMatchResponse> restoreSavedMatch(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID matchId) {
        SavedMatchResponse response = matchService.restoreSavedMatch(userId, matchId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mutual")
    public ResponseEntity<List<MutualMatchResponse>> getMutualMatches(
            @RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(matchService.getMutualMatches(userId));
    }

}
